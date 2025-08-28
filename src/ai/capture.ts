
// Скриншот превью для Vision API (заглушка - будет реализовано позже)

export async function captureWalletPreview(): Promise<Blob> {
  // TODO: Использовать html2canvas из utils/imageExport.ts
  // const canvas = await html2canvas(previewElement);
  // return new Promise(resolve => canvas.toBlob(resolve));
  
  throw new Error('captureWalletPreview not implemented yet');
}

export function getPreviewDataUrl(): string {
  // TODO: Вернуть data:// URL для превью
  throw new Error('getPreviewDataUrl not implemented yet');
}
