/**
 * Comptes de démonstration.
 *
 * Seuls les utilisateurs sont insérés : aucune société, aucun dossier. La
 * démonstration part d'une page blanche et chaque visiteur la construit — les
 * dossiers fabriqués ont été retirés du frontend pour cette raison.
 *
 * Le script est rejouable : il met à jour les comptes existants au lieu de
 * les dupliquer.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

interface CompteDemo {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  /** Mot de passe en clair, haché avant écriture. Absent : connexion démo seule. */
  motDePasse?: string;
  profile?: Record<string, unknown>;
}

const COMPTES: CompteDemo[] = [
  { id: '1', email: 'cheikh@example.com', name: 'Cheikh Diop', phone: '+221771234567', role: Role.client },
  {
    id: '2',
    email: 'admin@cresus.sn',
    name: 'Admin Crésus',
    phone: '+221771111111',
    role: Role.admin,
    // Le mot de passe d'administration ne se devine pas : il vient de
    // l'environnement, ou n'existe pas (connexion démo seule).
    motDePasse: process.env.SEED_ADMIN_PASSWORD,
  },
  { id: '3', email: 'comptable@cresus.sn', name: 'Amadou Diop', role: Role.accountant },
  // Les mots de passe bancaires sont ceux, publics, du prototype.
  {
    id: 'bank-user-boa', email: 'boa@bank.sn', name: 'Bank of Africa', phone: '+221771234000',
    role: Role.bank, motDePasse: 'boa123',
    profile: { firstName: 'BOA', lastName: 'Banque', bankId: 'boa', hasCompletedOnboarding: true },
  },
  {
    id: 'bank-user-sgbs', email: 'sgbs@bank.sn', name: 'SGBS Banque', phone: '+221771234001',
    role: Role.bank, motDePasse: 'sgbs123',
    profile: { firstName: 'SGBS', lastName: 'Banque', bankId: 'sgbs', hasCompletedOnboarding: true },
  },
  {
    id: 'bank-user-ecobank', email: 'eco@bank.sn', name: 'Ecobank', phone: '+221771234002',
    role: Role.bank, motDePasse: 'eco123',
    profile: { firstName: 'Ecobank', lastName: 'Banque', bankId: 'ecobank', hasCompletedOnboarding: true },
  },
];

const principal = async () => {
  for (const compte of COMPTES) {
    const passwordHash = compte.motDePasse ? await hash(compte.motDePasse, 10) : null;
    const champs = {
      email: compte.email,
      name: compte.name,
      phone: compte.phone ?? null,
      role: compte.role,
      profile: (compte.profile ?? {}) as object,
      // Un nouveau passage sans mot de passe ne doit pas effacer celui qui existe.
      ...(passwordHash ? { passwordHash } : {}),
    };
    await prisma.user.upsert({
      where: { id: compte.id },
      create: { id: compte.id, ...champs },
      update: champs,
    });
  }
  console.log(`${COMPTES.length} comptes de démonstration à jour.`);
};

principal()
  .catch(erreur => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
