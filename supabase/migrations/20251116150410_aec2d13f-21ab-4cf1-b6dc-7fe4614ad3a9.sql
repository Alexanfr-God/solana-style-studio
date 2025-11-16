-- Создаём триггер на таблице nft_ratings для автоматического пересчёта статистики
CREATE TRIGGER update_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.nft_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_rating_stats();

-- Комментарий для документации
COMMENT ON TRIGGER update_rating_stats_trigger ON public.nft_ratings IS 
'Автоматически пересчитывает rating_avg и rating_count в minted_themes при изменении рейтингов';