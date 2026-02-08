import { ref } from 'vue';

export function useSuccessModal() {
  const isSuccessModalOpen = ref(false);
  const successMessage = ref('');

  const showSuccess = (message) => {
    successMessage.value = message;
    isSuccessModalOpen.value = true;
  };

  const closeSuccessModal = () => {
    isSuccessModalOpen.value = false;
    successMessage.value = '';
  };

  return {
    isSuccessModalOpen,
    successMessage,
    showSuccess,
    closeSuccessModal,
  };
}