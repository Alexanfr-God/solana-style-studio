
// Leonardo API для генерации фонов (заглушка)

export async function generateWallpaper(prompt: string): Promise<string> {
  // TODO: Отправить промпт в Leonardo API
  // ENV: LEONARDO_API_KEY  
  // Возвращает публичный URL изображения
  
  return Promise.reject('generateWallpaper not implemented yet');
}

export async function uploadToSupabaseStorage(imageUrl: string): Promise<string> {
  // TODO: Скачать картинку и загрузить в Supabase Storage
  // Вернуть публичный URL из Storage (CORS-дружелюбный)
  
  return Promise.reject('uploadToSupabaseStorage not implemented yet');
}
