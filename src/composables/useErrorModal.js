import { ref } from 'vue';

export function useErrorModal() {
  const isErrorModalOpen = ref(false);
  const errorMessage = ref('');

  const showError = (message) => {
    errorMessage.value = message;
    isErrorModalOpen.value = true;
  };

  const closeErrorModal = () => {
    isErrorModalOpen.value = false;
    errorMessage.value = '';
  };

  return {
    isErrorModalOpen,
    errorMessage,
    showError,
    closeErrorModal,
  };
}
