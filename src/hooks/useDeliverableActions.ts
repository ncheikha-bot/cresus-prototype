import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  type BrandingProject,
  type ProjectMessage,
  type ProjectDeliverable,
} from '../data/brandingData';
import { nouvelId } from '../lib/id';

interface UseDeliverableActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useDeliverableActions = (
  project: BrandingProject | null,
  messages: ProjectMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ProjectMessage[]>>,
  options?: UseDeliverableActionsOptions
) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<ProjectDeliverable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer les révisions restantes
  const revisionsRemaining = project 
    ? project.service.revisionsIncluded - project.revisionsUsed 
    : 0;

  // Ouvrir le modal de review
  const openReviewModal = useCallback((deliverable: ProjectDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowReviewModal(true);
  }, []);

  // Fermer le modal de review
  const closeReviewModal = useCallback(() => {
    setShowReviewModal(false);
    setTimeout(() => setSelectedDeliverable(null), 300);
  }, []);

  // Approuver un livrable
  const handleApproveDeliverable = useCallback(
    async (comment?: string) => {
      if (!project || !selectedDeliverable) {
        options?.onError?.('Projet ou livrable non sélectionné');
        return;
      }

      setIsSubmitting(true);

      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Créer le message d'approbation
        const approvalMessage: ProjectMessage = {
          id: nouvelId('msg'),
          type: 'approval',
          author: 'client',
          authorName: 'Vous',
          content: comment || `J'approuve le livrable "${selectedDeliverable.name}". Merci pour ce travail !`,
          timestamp: new Date(),
          deliverableId: selectedDeliverable.id,
          metadata: {
            deliverableName: selectedDeliverable.name,
            approved: true,
          },
        };

        // Ajouter le message
        setMessages(prev => [...prev, approvalMessage]);

        console.log('Livrable approuvé :', {
          deliverable: selectedDeliverable.name,
          comment,
          timestamp: new Date(),
        });

        // Callback de succès
        options?.onSuccess?.();

        // Fermer le modal
        closeReviewModal();

        // TODO: Appel API réel
        // await fetch(`/api/branding/projects/${project.id}/deliverables/${selectedDeliverable.id}/approve`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ comment }),
        // });
      } catch (error) {
        console.error('Erreur lors de l\'approbation :', error);
        options?.onError?.('Impossible d\'approuver le livrable. Veuillez réessayer.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [project, selectedDeliverable, setMessages, options, closeReviewModal]
  );

  // Demander une révision
  const handleRequestRevision = useCallback(
    async (revisionNotes: string) => {
      if (!project || !selectedDeliverable) {
        options?.onError?.('Projet ou livrable non sélectionné');
        return;
      }

      if (revisionsRemaining <= 0) {
        options?.onError?.('Vous avez utilisé toutes vos révisions incluses.');
        return;
      }

      if (!revisionNotes.trim()) {
        options?.onError?.('Veuillez décrire les modifications souhaitées.');
        return;
      }

      setIsSubmitting(true);

      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 500));

        // Créer le message de demande de révision
        const revisionMessage: ProjectMessage = {
          id: nouvelId('msg'),
          type: 'revision-request',
          author: 'client',
          authorName: 'Vous',
          content: `Modifications demandées pour "${selectedDeliverable.name}":\n\n${revisionNotes}`,
          timestamp: new Date(),
          deliverableId: selectedDeliverable.id,
          metadata: {
            deliverableName: selectedDeliverable.name,
            revisionNumber: project.revisionsUsed + 1,
          },
        };

        // Ajouter le message
        setMessages(prev => [...prev, revisionMessage]);

        console.log('Révision demandée :', {
          deliverable: selectedDeliverable.name,
          revisionNotes,
          revisionNumber: project.revisionsUsed + 1,
          timestamp: new Date(),
        });

        // Callback de succès
        options?.onSuccess?.();

        // Fermer le modal
        closeReviewModal();

        // TODO: Appel API réel
        // await fetch(`/api/branding/projects/${project.id}/deliverables/${selectedDeliverable.id}/request-revision`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ revisionNotes }),
        // });
      } catch (error) {
        console.error('Erreur lors de la demande de révision :', error);
        options?.onError?.('Impossible de demander une révision. Veuillez réessayer.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [project, selectedDeliverable, revisionsRemaining, setMessages, options, closeReviewModal]
  );

  // Télécharger un fichier
  const handleDownloadFile = useCallback((fileId: string, fileName: string) => {
    console.log('Téléchargement du fichier :', fileName);
    
    // TODO: Implémenter le téléchargement réel
    // window.open(`/api/files/${fileId}/download`, '_blank');
    
    // Pour la démo, on simule
    toast.info(`Téléchargement de "${fileName}" (simulé)`);
  }, []);

  // Télécharger tous les fichiers d'un livrable
  const handleDownloadAll = useCallback((deliverable: ProjectDeliverable) => {
    console.log('Téléchargement de tous les fichiers :', deliverable.name);
    
    // TODO: Implémenter le téléchargement en ZIP
    // window.open(`/api/deliverables/${deliverable.id}/download-all`, '_blank');
    
    // Pour la démo, on simule
    toast.info(`Téléchargement de tous les fichiers de "${deliverable.name}" (simulé)`);
  }, []);

  return {
    // États
    showReviewModal,
    selectedDeliverable,
    isSubmitting,
    revisionsRemaining,

    // Actions
    openReviewModal,
    closeReviewModal,
    handleApproveDeliverable,
    handleRequestRevision,
    handleDownloadFile,
    handleDownloadAll,
  };
};
