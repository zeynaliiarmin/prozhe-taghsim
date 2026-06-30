export const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const fileToData = async (file: File, _existing?: string, _folder?: string): Promise<string> => {
  return fileToDataUrl(file);
};

export const deleteStoredImage = async (_url: string): Promise<void> => {
  // No-op for localStorage-based storage
};
