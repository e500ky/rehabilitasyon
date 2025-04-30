export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getStatusLabel = (status: string): { label: string; colorClass: string } => {
  switch (status) {
    case 'pending':
      return { label: 'Beklemede', colorClass: 'statusPending' };
    case 'accepted':
      return { label: 'Başladı', colorClass: 'statusAccepted' };
    case 'completed':
      return { label: 'Tamamlandı', colorClass: 'statusCompleted' };
    case 'cancelled':
      return { label: 'İptal Edildi', colorClass: 'statusCancelled' };
    default:
      return { label: status, colorClass: '' };
  }
};
