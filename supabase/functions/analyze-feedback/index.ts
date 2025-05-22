
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Parse the request body
    const { prompt } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get feedback data for the prompt
    const { data: feedbackData, error: feedbackError } = await supabaseClient
      .from('image_feedback')
      .select('*')
      .eq('prompt', prompt)
      
    if (feedbackError) {
      throw new Error(`Error fetching feedback: ${feedbackError.message}`)
    }
    
    if (!feedbackData || feedbackData.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No feedback data available for analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Simple analytics
    const totalRatings = feedbackData.length
    const averageRating = feedbackData.reduce((sum, item) => sum + item.rating, 0) / totalRatings
    
    // Collect feedback texts and tags
    const feedbackTexts = feedbackData
      .filter(item => item.feedback_text)
      .map(item => item.feedback_text)
    
    const allTags = feedbackData
      .filter(item => item.tags && item.tags.length > 0)
      .flatMap(item => item.tags)
    
    // Count tag frequencies
    const tagFrequency: Record<string, number> = {}
    allTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
    })
    
    // Sort tags by frequency
    const sortedTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
    
    // Basic sentiment analysis on feedback texts (very simplistic)
    const positiveWords = ['good', 'great', 'nice', 'love', 'amazing', 'excellent', 'perfect', 'beautiful']
    const negativeWords = ['bad', 'poor', 'awful', 'terrible', 'dislike', 'hate', 'wrong', 'ugly']
    
    let positiveCount = 0
    let negativeCount = 0
    
    feedbackTexts.forEach(text => {
      const lowerText = text.toLowerCase()
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++
      })
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++
      })
    })
    
    // Generate insights
    const insights = []
    
    if (averageRating < 3) {
      insights.push('The average rating is low. Consider revising the prompt significantly.')
    } else if (averageRating >= 4) {
      insights.push('The prompt is generally well-received.')
    }
    
    if (positiveCount > negativeCount * 2) {
      insights.push('Feedback is predominantly positive.')
    } else if (negativeCount > positiveCount * 2) {
      insights.push('Feedback is predominantly negative. Consider major revisions.')
    }
    
    if (sortedTags.length > 0) {
      const topTags = sortedTags.slice(0, 3).map(t => t.tag).join(', ')
      insights.push(`Most mentioned aspects: ${topTags}`)
    }
    
    // Return analysis results
    return new Response(
      JSON.stringify({
        prompt,
        stats: {
          totalFeedback: totalRatings,
          averageRating,
          positiveCount,
          negativeCount,
        },
        topTags: sortedTags.slice(0, 5),
        insights,
        feedbackSamples: feedbackTexts.slice(0, 5) // Include a few examples of feedback
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-feedback function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze feedback data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
