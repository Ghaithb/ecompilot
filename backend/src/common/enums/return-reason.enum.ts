export enum ReturnReason {
  PRODUCT_DIFFERENT = 'product_different',
  DEFECTIVE = 'defective',
  WRONG_SIZE = 'wrong_size',
  CHANGE_OF_MIND = 'change_of_mind',
  CLIENT_ABSENT = 'client_absent',
  OTHER = 'other',
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  [ReturnReason.PRODUCT_DIFFERENT]: 'Produit différent de la commande',
  [ReturnReason.DEFECTIVE]: 'Produit défectueux',
  [ReturnReason.WRONG_SIZE]: 'Mauvaise taille',
  [ReturnReason.CHANGE_OF_MIND]: 'Changement d\'avis',
  [ReturnReason.CLIENT_ABSENT]: 'Client absent',
  [ReturnReason.OTHER]: 'Autre',
};
