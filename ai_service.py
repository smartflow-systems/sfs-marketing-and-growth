"""
AI Service Module
Handles AI-powered content generation using OpenAI and Anthropic Claude
"""

import os
import logging
from typing import List, Dict, Optional, Literal
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Try importing AI SDKs
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI SDK not installed. Install with: pip install openai")

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    logger.warning("Anthropic SDK not installed. Install with: pip install anthropic")


@dataclass
class GeneratedPost:
    """Represents a generated social media post"""
    caption: str
    hashtags: List[str]
    platform: str
    variation_number: int


class AIContentGenerator:
    """
    Unified AI content generator supporting multiple providers
    Falls back gracefully if APIs are not configured
    """

    def __init__(self):
        self.openai_api_key = os.environ.get("OPENAI_API_KEY")
        self.anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.preferred_provider = os.environ.get("AI_PROVIDER", "anthropic").lower()

        # Initialize clients
        if self.openai_api_key and OPENAI_AVAILABLE:
            self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
            logger.info("OpenAI client initialized")
        else:
            self.openai_client = None

        if self.anthropic_api_key and ANTHROPIC_AVAILABLE:
            self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            logger.info("Anthropic client initialized")
        else:
            self.anthropic_client = None

    def is_available(self) -> bool:
        """Check if any AI provider is available"""
        return self.openai_client is not None or self.anthropic_client is not None

    def generate_social_posts(
        self,
        topic: str,
        niche: str,
        platform: Literal['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'],
        tone: Literal['Professional', 'Casual', 'Funny', 'Inspirational', 'Educational'],
        num_variations: int = 3
    ) -> List[GeneratedPost]:
        """
        Generate social media posts using AI

        Args:
            topic: The topic or announcement to post about
            niche: The business niche (e.g., 'Tech & SaaS', 'E-commerce')
            platform: Target social media platform
            tone: Desired tone of the content
            num_variations: Number of variations to generate (default: 3)

        Returns:
            List of GeneratedPost objects
        """

        # If no AI provider available, return mock data
        if not self.is_available():
            logger.warning("No AI provider available, using fallback mock data")
            return self._generate_mock_posts(topic, niche, platform, tone, num_variations)

        # Build the prompt
        prompt = self._build_prompt(topic, niche, platform, tone, num_variations)

        # Try preferred provider first, then fallback
        try:
            if self.preferred_provider == "anthropic" and self.anthropic_client:
                return self._generate_with_anthropic(prompt, platform, num_variations)
            elif self.preferred_provider == "openai" and self.openai_client:
                return self._generate_with_openai(prompt, platform, num_variations)
            else:
                # Fallback to any available provider
                if self.anthropic_client:
                    return self._generate_with_anthropic(prompt, platform, num_variations)
                elif self.openai_client:
                    return self._generate_with_openai(prompt, platform, num_variations)
        except Exception as e:
            logger.error(f"AI generation failed: {e}", exc_info=True)
            # Fallback to mock data on error
            return self._generate_mock_posts(topic, niche, platform, tone, num_variations)

        # Final fallback
        return self._generate_mock_posts(topic, niche, platform, tone, num_variations)

    def _build_prompt(self, topic: str, niche: str, platform: str, tone: str, num_variations: int) -> str:
        """Build the AI prompt for post generation"""

        platform_guidelines = {
            'Instagram': {
                'max_chars': 2200,
                'hashtag_count': 8,
                'style': 'Visual storytelling, engaging captions with emojis, encourage comments'
            },
            'Twitter': {
                'max_chars': 280,
                'hashtag_count': 3,
                'style': 'Concise, punchy, conversational, thread-friendly'
            },
            'LinkedIn': {
                'max_chars': 3000,
                'hashtag_count': 5,
                'style': 'Professional, thought leadership, insights and value-driven'
            },
            'Facebook': {
                'max_chars': 1000,
                'hashtag_count': 5,
                'style': 'Conversational, community-focused, storytelling'
            },
            'TikTok': {
                'max_chars': 300,
                'hashtag_count': 6,
                'style': 'Trendy, attention-grabbing, hook in first line'
            }
        }

        guidelines = platform_guidelines.get(platform, platform_guidelines['Instagram'])

        prompt = f"""You are an expert social media content creator specializing in the {niche} industry.

Create {num_variations} unique social media posts for {platform} about the following topic:
"{topic}"

Requirements:
- Platform: {platform}
- Tone: {tone}
- Style: {guidelines['style']}
- Maximum characters: {guidelines['max_chars']}
- Number of hashtags: {guidelines['hashtag_count']}
- Niche: {niche}

For each variation:
1. Write an engaging caption that follows {platform}'s best practices
2. Include appropriate emojis (but don't overdo it)
3. Add a call-to-action when relevant
4. Generate {guidelines['hashtag_count']} relevant hashtags for the {niche} niche

Format your response as JSON with this exact structure:
{{
  "posts": [
    {{
      "caption": "The post caption here...",
      "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3"]
    }}
  ]
}}

Make each variation unique in approach but equally engaging. Variation 1 should be the most creative, variation 2 more straightforward, variation 3 somewhere in between.

IMPORTANT: Respond ONLY with valid JSON, no additional text."""

        return prompt

    def _generate_with_anthropic(self, prompt: str, platform: str, num_variations: int) -> List[GeneratedPost]:
        """Generate using Anthropic Claude"""
        try:
            message = self.anthropic_client.messages.create(
                model="claude-sonnet-4-5-20250929",  # Latest Claude model
                max_tokens=2000,
                temperature=0.8,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Extract JSON from response
            response_text = message.content[0].text
            import json
            data = json.loads(response_text)

            posts = []
            for idx, post_data in enumerate(data.get('posts', [])[:num_variations]):
                posts.append(GeneratedPost(
                    caption=post_data['caption'],
                    hashtags=post_data['hashtags'],
                    platform=platform,
                    variation_number=idx + 1
                ))

            logger.info(f"Generated {len(posts)} posts using Anthropic Claude")
            return posts

        except Exception as e:
            logger.error(f"Anthropic generation error: {e}", exc_info=True)
            raise

    def _generate_with_openai(self, prompt: str, platform: str, num_variations: int) -> List[GeneratedPost]:
        """Generate using OpenAI GPT"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # Latest GPT-4 model
                messages=[{
                    "role": "system",
                    "content": "You are an expert social media content creator. Always respond with valid JSON only."
                }, {
                    "role": "user",
                    "content": prompt
                }],
                temperature=0.8,
                max_tokens=2000,
                response_format={"type": "json_object"}  # Force JSON mode
            )

            import json
            data = json.loads(response.choices[0].message.content)

            posts = []
            for idx, post_data in enumerate(data.get('posts', [])[:num_variations]):
                posts.append(GeneratedPost(
                    caption=post_data['caption'],
                    hashtags=post_data['hashtags'],
                    platform=platform,
                    variation_number=idx + 1
                ))

            logger.info(f"Generated {len(posts)} posts using OpenAI GPT-4")
            return posts

        except Exception as e:
            logger.error(f"OpenAI generation error: {e}", exc_info=True)
            raise

    def _generate_mock_posts(
        self,
        topic: str,
        niche: str,
        platform: str,
        tone: str,
        num_variations: int
    ) -> List[GeneratedPost]:
        """Fallback mock post generation"""

        hashtag_sets = {
            'Tech & SaaS': ['#SaaS', '#TechStartup', '#B2B', '#ProductLaunch', '#Innovation', '#TechNews', '#Startup', '#DigitalTransformation'],
            'E-commerce': ['#Ecommerce', '#OnlineShopping', '#Retail', '#ShopSmall', '#OnlineBusiness', '#DropShipping', '#EcommerceTips'],
            'Fitness & Wellness': ['#Fitness', '#Wellness', '#HealthyLiving', '#WorkoutMotivation', '#FitnessGoals', '#HealthyLifestyle'],
            'Finance & Investing': ['#Finance', '#Investing', '#PersonalFinance', '#WealthBuilding', '#FinancialFreedom', '#MoneyTips'],
            'Food & Beverage': ['#Foodie', '#FoodPhotography', '#Cooking', '#FoodLovers', '#Delicious', '#FoodBlogger'],
            'Fashion & Beauty': ['#Fashion', '#Beauty', '#Style', '#OOTD', '#BeautyBlogger', '#FashionInspo'],
            'Real Estate': ['#RealEstate', '#Property', '#HomeForSale', '#RealEstateInvesting', '#DreamHome'],
            'Marketing & Advertising': ['#Marketing', '#DigitalMarketing', '#GrowthHacking', '#ContentMarketing', '#MarketingTips'],
            'Travel & Lifestyle': ['#Travel', '#Wanderlust', '#TravelBlogger', '#Lifestyle', '#Adventure', '#TravelPhotography'],
            'Education & Coaching': ['#Education', '#Learning', '#Coaching', '#PersonalDevelopment', '#SelfImprovement'],
        }

        base_hashtags = hashtag_sets.get(niche, hashtag_sets['Tech & SaaS'])
        hashtag_count = 3 if platform == 'Twitter' else 8 if platform == 'Instagram' else 5
        hashtags = base_hashtags[:hashtag_count]

        posts = []

        # Variation 1: Creative
        if platform == 'Instagram':
            caption = f"✨ {topic}\n\nWe're beyond excited to share this with our amazing community! 🚀\n\nThis has been months in the making, and we can't wait to hear what you think.\n\n👉 What features would you love to see next? Drop a comment below! 👇"
        elif platform == 'Twitter':
            caption = f"🚀 Just launched: {topic}\n\nHere's what makes it special 🧵"
        elif platform == 'LinkedIn':
            caption = f"I'm thrilled to announce {topic}.\n\nAfter months of hard work and iteration, we've created something that I believe will make a real difference in the {niche} space.\n\nKey highlights:\n• {tone} approach to solving real problems\n• Built with community feedback\n• Focused on delivering value\n\nWhat challenges are you facing in {niche}? Let's discuss in the comments."
        else:
            caption = f"{topic} is here! 🎉\n\nWe've poured our hearts into this and would love your thoughts."

        posts.append(GeneratedPost(caption=caption, hashtags=hashtags, platform=platform, variation_number=1))

        # Variation 2: Straightforward
        caption = f"Introducing {topic}!\n\nWe built this to help {niche} professionals work smarter, not harder.\n\nReady to get started? Check it out and let us know what you think!"
        posts.append(GeneratedPost(caption=caption, hashtags=hashtags, platform=platform, variation_number=2))

        # Variation 3: In-between
        caption = f"Big news! 📣\n\n{topic} is officially live.\n\nThis is a game-changer for {niche}. Here's why:\n\n✅ Built for {tone.lower()} use\n✅ Designed with your feedback\n✅ Ready to scale with you\n\nTry it today!"
        posts.append(GeneratedPost(caption=caption, hashtags=hashtags, platform=platform, variation_number=3))

        return posts[:num_variations]

    def generate_email_content(
        self,
        subject: str,
        audience: str,
        goal: str,
        tone: str = "Professional"
    ) -> Dict[str, str]:
        """
        Generate email campaign content

        Args:
            subject: Email subject/theme
            audience: Target audience description
            goal: Campaign goal (e.g., 'conversions', 'engagement', 'awareness')
            tone: Desired tone

        Returns:
            Dict with 'subject_line', 'preview_text', and 'body'
        """

        if not self.is_available():
            return self._generate_mock_email(subject, audience, goal)

        prompt = f"""You are an expert email marketing copywriter.

Create a high-converting email for the following campaign:
- Subject/Theme: {subject}
- Target Audience: {audience}
- Goal: {goal}
- Tone: {tone}

Generate:
1. A compelling subject line (50-60 characters)
2. Preview text (40-100 characters)
3. Email body (HTML format, 200-400 words)

The email should:
- Hook the reader immediately
- Provide clear value
- Include a strong call-to-action
- Be optimized for mobile
- Use persuasive copywriting techniques

Format as JSON:
{{
  "subject_line": "...",
  "preview_text": "...",
  "body_html": "..."
}}

IMPORTANT: Respond ONLY with valid JSON."""

        try:
            if self.anthropic_client:
                message = self.anthropic_client.messages.create(
                    model="claude-sonnet-4-5-20250929",
                    max_tokens=2000,
                    temperature=0.7,
                    messages=[{"role": "user", "content": prompt}]
                )
                import json
                return json.loads(message.content[0].text)
            elif self.openai_client:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an email marketing expert. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                import json
                return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"Email generation error: {e}", exc_info=True)
            return self._generate_mock_email(subject, audience, goal)

        return self._generate_mock_email(subject, audience, goal)

    def _generate_mock_email(self, subject: str, audience: str, goal: str) -> Dict[str, str]:
        """Fallback mock email generation"""
        return {
            "subject_line": f"🚀 {subject} - You Won't Want to Miss This",
            "preview_text": f"Exclusive opportunity for {audience}",
            "body_html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FFD700;">Hello!</h2>
                <p>We have exciting news to share about <strong>{subject}</strong>.</p>
                <p>As part of our {audience} community, you're among the first to know about this opportunity.</p>
                <p>Our goal is simple: {goal}.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background: #FFD700; color: #0D0D0D; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Learn More
                    </a>
                </div>
                <p>Questions? Just reply to this email - we're here to help!</p>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    SmartFlow Systems | Powering your growth
                </p>
            </div>
            """
        }


# Global singleton instance
_ai_generator = None

def get_ai_generator() -> AIContentGenerator:
    """Get or create the global AI generator instance"""
    global _ai_generator
    if _ai_generator is None:
        _ai_generator = AIContentGenerator()
    return _ai_generator
