import type { INestApplication } from '@nestjs/common';
import { hash } from 'bcryptjs';
import request from 'supertest';
import { creerApplication } from '../src/application';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Parcours de l'API tels que le frontend les emprunte, et surtout les refus :
 * un backend partagé ne vaut que si un client ne peut ni voir ni modifier le
 * dossier d'un autre.
 */
describe('API Crésus', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adresse: string;
  const jetons: Record<string, string> = {};

  const api = () => request(app.getHttpServer());
  const avec = (qui: string) => ({ Authorization: `Bearer ${jetons[qui]}` });
  const ecrire = (qui: string, collection: string, id: string, data: object) =>
    api().put(`/api/collections/${collection}/${id}`).set(avec(qui)).send({ data });

  beforeAll(async () => {
    app = await creerApplication();
    await app.listen(0);
    adresse = await app.getUrl();
    prisma = app.get(PrismaService);

    await prisma.user.createMany({
      data: [
        { id: '1', email: 'cheikh@example.com', name: 'Cheikh Diop', role: 'client' },
        { id: 'client-2', email: 'awa@example.com', name: 'Awa Fall', role: 'client' },
        { id: '2', email: 'admin@cresus.sn', name: 'Admin', role: 'admin', passwordHash: await hash('motdepasse-admin', 4) },
        { id: '3', email: 'comptable@cresus.sn', name: 'Comptable', role: 'accountant' },
        { id: 'bank-user-boa', email: 'boa@bank.sn', name: 'BOA', role: 'bank', profile: { bankId: 'boa' } },
      ],
    });

    for (const [qui, id] of [['client', '1'], ['autre', 'client-2'], ['admin', '2'], ['comptable', '3'], ['banque', 'bank-user-boa']]) {
      const reponse = await api().post('/api/auth/demo').send({ utilisateurId: id }).expect(200);
      jetons[qui] = reponse.body.jeton;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('accès', () => {
    it('répond sur la santé sans jeton', async () => {
      await api().get('/api/health').expect(200, { statut: 'ok', base: 'ok' });
    });

    it('refuse les collections sans jeton, ou avec un jeton forgé', async () => {
      await api().get('/api/collections').expect(401);
      await api().get('/api/collections').set({ Authorization: 'Bearer faux.jeton.ici' }).expect(401);
    });

    it('connecte par mot de passe, sans révéler quelles adresses existent', async () => {
      const ok = await api().post('/api/auth/login').send({ email: 'admin@cresus.sn', motDePasse: 'motdepasse-admin' }).expect(200);
      expect(ok.body.utilisateur).toMatchObject({ id: '2', role: 'admin' });

      const faux = await api().post('/api/auth/login').send({ email: 'admin@cresus.sn', motDePasse: 'non' }).expect(401);
      const inconnu = await api().post('/api/auth/login').send({ email: 'personne@cresus.sn', motDePasse: 'non' }).expect(401);
      expect(faux.body.message).toEqual(inconnu.body.message);
    });

    it('rend le profil du jeton', async () => {
      const r = await api().get('/api/auth/me').set(avec('banque')).expect(200);
      expect(r.body).toMatchObject({ id: 'bank-user-boa', role: 'bank', bankId: 'boa' });
    });

    it('rejette une collection inconnue, un identifiant invalide, un corps sans data', async () => {
      await api().get('/api/collections/inconnue').set(avec('client')).expect(404);
      await ecrire('client', 'companies', 'id avec espaces', { userId: '1' }).expect(400);
      await api().put('/api/collections/companies/x').set(avec('client')).send({ autre: 1 }).expect(400);
    });
  });

  describe('sociétés et dossiers', () => {
    it('un client crée sa société ; il la lit, un autre client non, l’administration oui', async () => {
      await ecrire('client', 'companies', 'comp-a', { name: 'ALPHA SARL', status: 'submitted', userId: '1' }).expect(200);

      const siennes = await api().get('/api/collections/companies').set(avec('client')).expect(200);
      expect(siennes.body.map((e: { id: string }) => e.id)).toEqual(['comp-a']);

      const autre = await api().get('/api/collections/companies').set(avec('autre')).expect(200);
      expect(autre.body).toEqual([]);

      const admin = await api().get('/api/collections/companies').set(avec('admin')).expect(200);
      expect(admin.body.map((e: { id: string }) => e.id)).toContain('comp-a');
    });

    it('un client ne peut ni modifier la société d’un autre, ni céder la sienne', async () => {
      await ecrire('autre', 'companies', 'comp-a', { name: 'PIRATÉE', userId: 'client-2' }).expect(403);
      await ecrire('client', 'companies', 'comp-a', { name: 'ALPHA SARL', userId: 'client-2' }).expect(403);
      await ecrire('autre', 'companies', 'comp-a', { name: 'PIRATÉE', userId: '1' }).expect(403);
    });

    it('l’identifiant de l’adresse fait foi sur celui du corps', async () => {
      const r = await ecrire('client', 'companies', 'comp-b', { id: 'comp-z', name: 'B', userId: '1' }).expect(200);
      expect(r.body.data.id).toBe('comp-b');
    });

    it('l’avancement arrivé avant sa société prend ensuite le propriétaire de la société', async () => {
      // Le tunnel écrit l'avancement et la société coup sur coup, dans un ordre quelconque.
      await ecrire('client', 'company-processes', 'comp-c', { statutsSent: false }).expect(200);
      await ecrire('client', 'companies', 'comp-c', { name: 'GAMMA', userId: '1' }).expect(200);

      const ligne = await prisma.companyProcess.findUnique({ where: { companyId: 'comp-c' } });
      expect(ligne?.ownerId).toBe('1');

      // L'administration le fait avancer ; un autre client ne peut ni le lire ni l'écrire.
      await ecrire('admin', 'company-processes', 'comp-c', { statutsSent: true }).expect(200);
      const lu = await api().get('/api/collections/company-processes').set(avec('client')).expect(200);
      expect(lu.body).toEqual([{ id: 'comp-c', data: { statutsSent: true } }]);
      const autre = await api().get('/api/collections/company-processes').set(avec('autre')).expect(200);
      expect(autre.body).toEqual([]);
      await ecrire('autre', 'company-processes', 'comp-c', { statutsSent: false }).expect(403);
    });

    it('supprime la société et son avancement, et tolère une seconde suppression', async () => {
      await api().delete('/api/collections/companies/comp-c').set(avec('autre')).expect(403);
      await api().delete('/api/collections/companies/comp-c').set(avec('client')).expect(204);
      await api().delete('/api/collections/companies/comp-c').set(avec('client')).expect(204);
      expect(await prisma.companyProcess.findUnique({ where: { companyId: 'comp-c' } })).toBeNull();
    });
  });

  describe('familles rattachées', () => {
    it('une demande bancaire hérite du client de la société, et n’est vue que de sa banque', async () => {
      await ecrire('client', 'bank-requests', 'req-1', { companyId: 'comp-a', bankId: 'boa', status: 'pending' }).expect(200);
      await ecrire('client', 'bank-requests', 'req-2', { companyId: 'comp-a', bankId: 'sgbs', status: 'pending' }).expect(200);

      const banque = await api().get('/api/collections/bank-requests').set(avec('banque')).expect(200);
      expect(banque.body.map((e: { id: string }) => e.id)).toEqual(['req-1']);

      // La banque fait avancer sa demande, pas celle d'une autre.
      await ecrire('banque', 'bank-requests', 'req-1', { companyId: 'comp-a', bankId: 'boa', status: 'approved' }).expect(200);
      await ecrire('banque', 'bank-requests', 'req-2', { companyId: 'comp-a', bankId: 'boa', status: 'approved' }).expect(403);
    });

    it('un client prévient l’administration, sans pouvoir toucher à ses notifications', async () => {
      await ecrire('admin', 'notifications', 'n-admin', { userId: '2', title: 'Interne', read: false }).expect(200);
      await ecrire('client', 'notifications', 'n-refus', { userId: '2', title: 'Devis refusé', read: false }).expect(200);
      await ecrire('client', 'notifications', 'n-admin', { userId: '2', title: 'Modifiée', read: true }).expect(403);

      const admin = await api().get('/api/collections/notifications').set(avec('admin')).expect(200);
      expect(admin.body.map((e: { id: string }) => e.id).sort()).toEqual(['n-admin', 'n-refus']);
      const client = await api().get('/api/collections/notifications').set(avec('client')).expect(200);
      expect(client.body).toEqual([]);
    });

    it('la comptabilité lit tout mais n’écrit que des notifications', async () => {
      const tout = await api().get('/api/collections').set(avec('comptable')).expect(200);
      expect(tout.body.companies.length).toBeGreaterThan(0);
      await ecrire('comptable', 'companies', 'comp-a', { name: 'X', userId: '1' }).expect(403);
      await ecrire('comptable', 'notifications', 'n-compta', { userId: '1', title: 'Pièce reçue' }).expect(200);
    });

    it('les brouillons restent à leur auteur', async () => {
      await ecrire('client', 'drafts', 'draft-1', { userId: '1', currentStep: 2 }).expect(200);
      await ecrire('client', 'drafts', 'draft-2', { userId: 'client-2', currentStep: 1 }).expect(403);
      const autre = await api().get('/api/collections/drafts').set(avec('autre')).expect(200);
      expect(autre.body).toEqual([]);
    });
  });

  describe('temps réel', () => {
    /** Ouvre le flux et collecte les messages reçus. */
    const ecouter = async (qui: string) => {
      const reponse = await fetch(`${adresse}/api/events?token=${jetons[qui]}`);
      expect(reponse.status).toBe(200);
      const messages: Array<Record<string, unknown>> = [];
      const lecteur = reponse.body!.getReader();
      const decodeur = new TextDecoder();
      let tampon = '';
      void (async () => {
        for (;;) {
          const { done, value } = await lecteur.read().catch(() => ({ done: true, value: undefined }));
          if (done) return;
          tampon += decodeur.decode(value, { stream: true });
          let fin: number;
          while ((fin = tampon.indexOf('\n\n')) !== -1) {
            const bloc = tampon.slice(0, fin);
            tampon = tampon.slice(fin + 2);
            const ligne = bloc.split('\n').find(l => l.startsWith('data: '));
            if (ligne) messages.push(JSON.parse(ligne.slice(6)));
          }
        }
      })();
      return { messages, fermer: () => lecteur.cancel() };
    };
    const attendre = (ms: number) => new Promise(r => setTimeout(r, ms));

    it('refuse le flux sans jeton', async () => {
      const r = await fetch(`${adresse}/api/events`);
      expect(r.status).toBe(401);
    });

    it('chaque poste reçoit les écritures qu’il a le droit de lire, et seulement celles-là', async () => {
      const client = await ecouter('client');
      const autre = await ecouter('autre');
      const admin = await ecouter('admin');
      await attendre(150);

      await ecrire('admin', 'companies', 'comp-a', { name: 'ALPHA SARL', status: 'in_review', userId: '1' }).expect(200);
      await ecrire('autre', 'companies', 'comp-autre', { name: 'AUTRE', userId: 'client-2' }).expect(200);
      await attendre(300);

      const ids = (m: Array<Record<string, unknown>>) => m.map(e => `${e.collection}/${e.id}`);
      expect(ids(client.messages)).toEqual(['companies/comp-a']);
      expect(client.messages[0]).toMatchObject({ type: 'upsert', data: { status: 'in_review' } });
      expect(client.messages[0]).not.toHaveProperty('proprietaire');
      expect(ids(autre.messages)).toEqual(['companies/comp-autre']);
      expect(ids(admin.messages)).toEqual(['companies/comp-a', 'companies/comp-autre']);

      await Promise.all([client.fermer(), autre.fermer(), admin.fermer()]);
    });
  });

  describe('réinitialisation', () => {
    it('est réservée à l’administration, efface les données et conserve les comptes', async () => {
      await api().post('/api/admin/reinitialiser').set(avec('client')).expect(403);
      await api().post('/api/admin/reinitialiser').set(avec('admin')).expect(204);

      const tout = await api().get('/api/collections').set(avec('admin')).expect(200);
      for (const lignes of Object.values(tout.body)) expect(lignes).toEqual([]);
      expect(await prisma.user.count()).toBe(5);
    });
  });
});
