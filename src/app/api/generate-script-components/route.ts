import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerationConfig, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// Removed: import { Source } from '@/contexts/AiWriterContext';
import { ScriptComponents, ScriptFactset } from '@/lib/types/scriptComponents'; // Import our new types

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini 1.5 Pro pricing (as of 2024) - Update these if pricing changes
const GEMINI_PRICING = {
  inputTokensPerMillion: 1.25, // $1.25 per 1M input tokens
  outputTokensPerMillion: 5.00, // $5.00 per 1M output tokens
};

// Function to estimate token count (rough approximation: 1 token ≈ 4 characters)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Function to calculate cost
function calculateCost(inputTokens: number, outputTokens: number) {
  const inputCost = (inputTokens / 1000000) * GEMINI_PRICING.inputTokensPerMillion;
  const outputCost = (outputTokens / 1000000) * GEMINI_PRICING.outputTokensPerMillion;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens,
    outputTokens,
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(6))
  };
}

// Updated responseSchema
const responseSchema = {
  type: "object",
  properties: {
    hooks: {
      type: "array",
      description: "Generate exactly 5 distinct, engaging hooks for a short-form video based on the provided topic and research analysis.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the hook (e.g., 'Problem Hook', 'Curiosity Hook', 'Benefit Hook')."
          },
          lines: {
            type: "array",
            description: "2-4 short lines that form the hook.",
            items: { type: "string" }
          }
        },
        required: ["title", "lines"]
      },
      minItems: 5,
      maxItems: 5
    },
    bridges: {
      type: "array",
      description: "Generate exactly 5 distinct bridge options that connect with the audience by addressing their frustrations, desires, and objections.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the bridge (e.g., 'Empathy Bridge', 'Problem Bridge', 'Relatability Bridge')."
          },
          content: {
            type: "string",
            description: "1-2 concise sentences that build rapport and make the message relatable."
          }
        },
        required: ["title", "content"]
      },
      minItems: 5,
      maxItems: 5
    },
    goldenNuggets: {
      type: "array",
      description: "Generate exactly 5 distinct golden nugget options that deliver the core value and solution of the video.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the golden nugget (e.g., 'Simple Solution', 'Key Insight', 'Core Method')."
          },
          content: {
            type: "string",
            description: "1-2 concise, highly impactful sentences that present the solution as 'easier than they think'."
          }
        },
        required: ["title", "content"]
      },
      minItems: 5,
      maxItems: 5
    },
    wtas: {
      type: "array",
      description: "Generate exactly 5 distinct 'Why To Act' options that provide compelling reasons for viewers to take specific actions.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short, descriptive title for the WTA including the action type (e.g., 'Follow - Daily Tips', 'Comment - Share Experience', 'Save - Reference Tool')."
          },
          actionType: {
            type: "string",
            description: "The primary action being requested (e.g., 'follow', 'comment', 'share', 'save', 'like')."
          },
          lines: {
            type: "array",
            description: "1-3 short lines that form the WTA, with action keywords positioned at the end.",
            items: { type: "string" }
          }
        },
        required: ["title", "actionType", "lines"]
      },
      minItems: 5,
      maxItems: 5
    }
  },
  required: ["hooks", "bridges", "goldenNuggets", "wtas"]
};

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ message: 'Gemini API configuration missing on server' }, { status: 500 });
  }

  try {
    const { videoIdea, researchAnalysisText } = await req.json() as { videoIdea: string, researchAnalysisText: string };

    if (!videoIdea || !researchAnalysisText) {
      return NextResponse.json({ message: 'Video idea and researchAnalysisText are required' }, { status: 400 });
    }

    // Presumed to be available in your API route, loaded as strings:
    const scriptingStyleTranscript = `**Core Scripting Style Explanation: My Video Creation Process**

**I. Overall Script Structure & Philosophy (The "Seven Laws of Script Writing"):**
* **Core Components:** Hook, Bridge, Golden Nugget, and Why To Act (WTA).
* **Fundamental Goal:** Hook the audience, speak directly to one person, deliver a clear and valuable message in a conversational tone, use micro-hooks for engagement, and provide a compelling reason to act.

**II. Key Principles for All Script Components:**
* **Speak to ONE Person:**
    * Wording must be crafted as if you are speaking directly to a single individual.
    * **Example:**
        * *Avoid:* "I know many of you have a problem."
        * *Use:* "I know you are struggling with this because many people do."
* **Tone & Delivery:**
    * **Easy to Understand:** Use simple, clear language.
    * **Conversational:** Maintain a natural, chatty style.
    * **Not Presentational:** Avoid a formal or speech-like delivery.
* **Use Micro-Hooks:** Integrate these throughout the script to continually re-engage the viewer.
* **Clear, Valuable Message:** Ensure the core takeaway is obvious and beneficial.
* **Reason to Act (WTA Distinction):** The WTA is not just a call to action; it's about providing the *reason why* the viewer should take that action. Focus on "What's the reason for people to take the action you want to take?"

**III. Detailed Breakdown of Script Components:**

    **A. Hook:**
    * **Primary Objectives (within the first 3 seconds):**
        1.  **Identify Audience:** Make it clear who the video is for.
        2.  **State Problem/Topic:** Clearly define what the video is about.
        3.  **Create Curiosity:** Pique the viewer's interest to learn more.
    * **Techniques for Curiosity:**
        * Add phrases to the end of the hook like: "And here is why," "And this is why," "Then try this instead," "Try this."
    * **Keyword Placement:**
        * Keywords should be positioned as close as possible to the **beginning** of the hook/video.
        * **Example (Keyword: Personal Branding):**
            * *Less Effective:* "Hey, in today's video, I wanna show you the three websites that are unbelievably powerful when it comes to building your personal brand."
            * *More Effective:* "If you are building your personal brand, here are the top three websites that are unbelievably powerful."

    **B. Bridge:**
    * **Core Purpose:** Address the audience's:
        * Frustrations
        * Desires
        * Objections
    * **Optional Element:** Can be a place for a little bit of appropriate humor.
    * **Content Strategy:**
        * If you can articulate the viewer's problem better than they can, they will immediately assume you have the solution.
        * Briefly address their frustrations to demonstrate understanding.
        * **Goal:** Create rapport, make them feel understood, and make your message more relatable.

    **C. Golden Nugget:**
    * **Core Purpose:**
        * Always deliver significant value.
        * Clearly present the solution or key insight.
        * This is the main takeaway/value proposition of the video.
    * **Key Framing:** Present the solution as being "easier than they think."
    * **Desired Audience Reaction:** "Oh, that was super useful. This could help me so much. I totally can see myself immediately using this."
    * **Language Requirements:**
        * **Simple Language:** Crucial, especially at the beginning and throughout the video.
        * **Example (Clarity over Jargon):**
            * *Less Effective:* "Here's how to get shallow depth of field on your smartphone."
            * *More Effective:* "You know that sexy blur background you see on some videos? Here's how to get it when filming with your phone."
    * **90/10 Value Principle ("Hinting"):**
        * **90% of the video content MUST focus on giving value.**
        * **Only 10%** should be a casual mention of a product, service, or event (e.g., "By the way, we have this to help you.").

    **D. Why To Act (WTA):**
    * **Meaning:** Stands for "Why To Act."
    * **Avoid Ineffective CTAs:** Do not use generic or demanding phrases like "Follow for more tips like this," or "Make sure you follow." These don't work.
    * **Adopt an Abundance Mindset:**
        * *Avoid:* "I gave so much value for free, now I deserve a follow."
        * *Embrace:* "I'm giving so much value, and I have *even more* value to give you."
    * **Core Function:** Give people a compelling *reason* to take the desired action.
        * Focus on: What's the benefit for *them*? What's the win for *them*? (Not what's in it for you).
    * **Keyword Placement:**
        * Action keywords (e.g., follow, share, comment) should be positioned as close as possible to the **end** of the sentence/video.
        * **Reason:** This helps to hide the fact that the video is coming to an end, making the call to action feel more natural.
    * **Blending Technique:**
        * Use the word "and" to smoothly transition from the last piece of content/tip into the WTA.
        * **Example of Structure:** "[Your last tip or valuable statement] **and** [compelling reason/benefit related to taking the action], so [action keyword like 'follow' or 'comment the word X']."
        * **Conceptual Example from transcript:** Instead of: "There are so many low-cost tools online to build an outstanding brand. Follow to learn more."
        * **Improved Approach:** Blend these ideas, placing "follow" at the very end: e.g., "There are so many low-cost tools online to build an outstanding brand, **and** if you want to [achieve specific benefit related to these tools], make sure you follow."

**IV. Delivery Note (Contextual, less for AI scripting focus):**
* Avoid shifting into a distinct "outro mode" with your voice during delivery, as it can signal the end too abruptly.

**V. WTA Templates Mentioned:**
* The transcript mentions the existence of specific templates for WTAs (e.g., for Follow, Comment, Save). These templates would be provided as a separate document or list.`;
    const humanizationPrinciples = `**Humanization Principles: Sentence Transformation Guide**

**Purpose:**
This guide outlines principles for transforming standard short-form video scripts into natural, human-sounding spoken scripts. The goal is to make scripts feel casual, conversational, and engaging, rather than written or presentational. The final script should sound like a one-on-one conversation with the viewer, not a speech or an advertisement.

**Who It's For:**
Creators of short-form videos for platforms like TikTok, Instagram Reels, and YouTube Shorts.

**Core Objectives (What to Do Well):**
* **Maintain Original Message:** The core idea and intent of the script must remain unchanged.
* **Improve Conversational Flow:** Reword sentences only to make the script sound like natural spoken language.
* **Use Casual, Friendly, Engaging Language:** Avoid robotic or corporate tones.
* **Address One Person:** Use "you" frequently to make the viewer feel personally spoken to.
* **Ensure Clarity & Ease of Understanding:** Avoid complex words or overly formal phrasing.

**What To Avoid:**
* **Changing Script Meaning:** Only reword; do not rewrite the core message.
* **Sounding Salesy:** No pushy or overtly promotional language.
* **Sounding Formal/Presentational:** Avoid a public speaking tone or lecture-style delivery.
* **Using Complex English:** Keep language simple, natural, and easy for a broad audience to understand.

**Desired Tone & Style:**
* **Casual & Inviting:** Like a friendly chat, not a pre-scripted speech.
* **Conversational:** Should sound as if the person is naturally talking to the camera.
* **Simple & Clear:** Use everyday words that are widely understood.
* **Engaging:** Keep the listener interested and feeling personally connected.

**Additional Instructions:**
* **Use Active Voice:** Avoid passive constructions where possible.
* **Address Viewer Directly:** Use "you" and "your" often and appropriately.
* **Avoid Broad Generalizations:** Stick to direct, specific statements.
* **Skip Formal Introductory/Concluding Phrases:** No "In conclusion," "In summary," etc.

**Words to Generally Avoid (for a more natural feel):**
* Game changer
* Plenty
* Dive in
* Explore
* Folks

---
**Sentence Transformation Principles**
---

**1. Presentational → Conversational**
* **Principle:** Convert formal, fact-heavy sentences into a more natural, conversational tone.
    * Use direct address (e.g., "you" instead of abstract references).
    * Simplify sentence structure.
    * Make it feel more relatable.
* **Example:**
    * **Incorrect:** "Studies show that in the United States, 73% of women aged 65–74 have high blood pressure or take medication to manage it."
    * **Correct:** "If you look at the studies, you'll see that if you're a woman in the US between 65 and 75, your chances of having high blood pressure are more than 73%."

**2. Formal → Informal (especially for niched language)**
* **Principle:** Make rigid, professional-sounding sentences more natural and engaging.
    * Use contractions (e.g., "you're" instead of "you are") and everyday phrases.
    * Speak directly to the audience.
    * Allow for a natural flow rather than an overly structured statement.
    * Use familiar, conversational language that sounds like how you'd talk to a friend.
* **Example 1:**
    * **Incorrect (Overly Formal):** "Patients often experience heightened anxiety prior to dental visits. To alleviate this concern, we require the completion of a standardized intake questionnaire that enables us to proactively identify potential complications."
    * **Correct (Conversational):** "You know when you need to go in for a dental check and you're freaking out? Because you're super scared of how much pain you're gonna experience? So what I like to do is have a simple questionnaire you fill out when you come into our clinic."
* **Example 2:**
    * **Incorrect (Structured Speech):** "Let me begin by discussing a scenario that many individuals encounter on a regular basis. This issue has significant implications that we must consider."
    * **Correct (Conversational):** "You know when something just keeps bugging you and you don't even know why? Yeah, this might be one of those things."
* **Helpful Conversational Phrases to Consider:**
    * "You know when you..."
    * "You must have seen..."
    * "I bet you're familiar with this scenario..."
    * "Think about the last time you..."

**3. Speaking to a Group → Speaking to One Person**
* **Principle:** Make the message feel like a personal, one-on-one conversation with the viewer.
    * Use singular pronouns like "you."
    * Avoid broad generalizations that address a crowd.
    * Frame the message as if speaking directly to the individual viewer.
* **Example:**
    * **Incorrect:** "Hey everyone, in today's video I wanna tell you guys about email marketing because I know many of you struggle with this."
    * **Correct:** "If you're struggling with your email marketing, I've got a simple technique that could help you today."

**4. Rewording Salesy Sentences**
* **Principle:** Transform sales-driven content to feel more helpful, insightful, and engaging rather than pushy.
    * Avoid direct "pain-point" questions that can feel like aggressive sales tactics.
    * Reframe statements as helpful insights or solutions.
    * Focus on generating curiosity and providing value.
* **Example:**
    * **Incorrect:** "Are you tired of not having enough clients as an online coach?"
    * **Correct:** "If you're struggling to get more clients as an online coach, try this!"

**5. Correct Keyword Placement**
* **Principle:** Place key information strategically within sentences for maximum engagement and clarity.
    * **Hooks:** Put the most important detail or keyword at the *beginning* of the hook.
    * **CTAs:** Save calls to action (like "Follow," "Like," "Subscribe") for the very *end* of the WTA/outro.
* **Example (Hook Keyword Placement):**
    * **Incorrect:** "Hey, in today's video I want to show you 3 websites that are unbelievably powerful when it comes to building your personal brand."
    * **Correct:** "If you are building your personal brand, here are the top 3 websites that are unbelievably powerful."

**6. Avoid Starting with Generic Salesy Questions**
* **Principle:** Avoid opening your script with questions that sound like generic sales copy (e.g., "Are you tired of..." or "Ever feel like..."). These can feel impersonal and push viewers away.
    * **Instead:** Use phrases like "You know when..." to build familiarity and relatability.
    * **Alternatively:** Use "If you feel like... then try this" to offer an immediate solution.
* **Example:**
    * **Incorrect:** "Ever feel like you're not good enough?"
    * **Correct:** "You know when you feel like you are just not good enough?"

**7. Speak in Simple English**
* **Principle:** Use clear, concise language that is easy for a broad audience to understand.
    * Use short sentences with basic vocabulary.
    * Avoid jargon or overly complex words.
    * Write in a way that reflects how people naturally talk.
    * Use real-world examples to make abstract ideas clearer.
* **Example:**
    * **Complex (Grade 14 level):** "Implementing a consistent sleep routine enhances cognitive function and emotional regulation, contributing to overall mental well-being."
    * **Simple (Grade 3 level):** "When you go to bed at the same time every night, your brain works better and you feel happier."

**8. Using Micro Hooks Throughout the Script**
* **Principle:** Integrate micro-hooks to reignite curiosity and keep viewers engaged, especially in longer scripts.
    * A simple way to add engagement is by inserting phrases like "...Why? Because..." between related statements or ideas.
* **Example Micro Hooks (to draw inspiration from):**
    * "So why am I telling you this? Because..."
    * "But here's the problem..."
    * "Now here is where it gets interesting..."
    * "I found the solution when I least expected it..."

**9. Add Conversational Softening Elements**
* **Principle:** Use words and phrases that make the tone more natural and less rigid or scripted.
    * Incorporate words like "just" or phrases like "it's like" to soften statements.
* **Example:**
    * **Incorrect (Slightly Abrupt):** "You know when you feel like you're not good enough? No matter how hard you try, it never seems to be enough."
    * **Correct (Softer, More Natural):** "You know when you feel like you're *just* not good enough? *It's like* no matter how hard you try, it never seems to be enough?"

**10. Start with the Viewer, Briefly Mention Others, Then Return to the Viewer**
* **Principle:** Create a connection by starting with "you," then broaden slightly to show shared experience, and then return the focus to the individual viewer.
    * Begin with "you" to immediately engage the viewer personally.
    * Briefly mention that others may feel or experience the same thing (builds community/validation).
    * Bring the focus back to "you" to make the message feel directly applicable and relatable.
* **Example:**
    * **Incorrect (Less Direct):** "Most dog owners think kibble is the best option for their pets. They believe it's balanced, easy, and what vets recommend. But processed food isn't always the healthiest choice."
    * **Correct (More Engaging):** "If *you* think kibble is the best option for *your* dog, *you* are making a big mistake. Many pet parents think that kibble is best because it's easy, it's what *your* vet recommends, and it seems balanced. But giving processed food to *your* dog isn't the healthiest choice."

**11. Observation → Implication**
* **Principle:** Don't just present a fact or observation; help the audience understand its meaning or relevance to them.
    * Acknowledge what the audience might be thinking or assuming.
    * Guide their understanding in a relatable way.
    * Use "you" to make the implication feel personal.
* **Example:**
    * **Incorrect (Simple Statement):** "Raw feeding might sound complicated at first, but it's actually pretty simple."
    * **Correct (Addresses Viewer's Thought + Implication):** "Now, *you* might think that raw feeding is complicated, but it's actually pretty simple when *you* give it a go."`;
    const microHookExamplesList = `**Micro-Hook Examples List**

* ...! Why? Because _____
* So why am I telling you this? Because _____
* So why is this important? Because as you _____
* So what does this mean for you? You _____
* So the real question is: _______?
* Now what do I mean by that? ______
* Now why does that happen? ______
* Now why does that happen? Really think about this! Why would _____
* Now here is what's interesting _____
* Now there is one critical thing that I left out: ____
* And the reason for that is _____
* And do you know why?
* And I know you are probably asking: How can I ______? Well, there is a simple answer to that.
* And when that happens what do you do?
* But there is a small problem: _____
* But here is the problem: _____
* But then what happens is ____
* But that's not why you can't _________
* But here's the surprising part ______
* But here is what I find _______
* Let me know if this sounds familiar: ______
* Here are some interesting numbers for you: ____
* What does that mean? It means that ____

**For Storytelling:**
* So I was ________ and then this happened.
* And that's when things started to go wrong ____
* Now here is where it gets interesting: ________
* But that isn't what makes this _____ so _____
* But there was one thing that really stood out to me ____
* And here comes the twist: ______
* I found the solution to this when I was least expecting it.
* I found inspiration on how to do this where I was least expecting it.`;
    const wtaTemplatesList = `**WTA (Why To Act) Templates & Engaging Questions List**

**I. WTA Templates by Action:**

    **A. WTA Templates - FOLLOW:**
    * If you want (SPECIFIC DESIRED OUTCOME) hit the follow.
    * If you are not sure how you are ever going to (SPECIFIC DESIRED OUTCOME) hit the follow.
    * For daily (GOLDEN SPINE) hit the follow.
    * It's a mission of mine to _______ .So hit that follow.
    * You can learn a lot about (GOLDEN SPINE) if you hit follow.
    * This week I have 3 more videos coming on this topic, so follow to not miss out.
    * You can stay ahead of ______ by following me.
    * You can learn ______ by following me / my account.
    * I'll keep you updated with _____ so hit the follow.
    * I'm gonna have to do a part 2 and part 3 so if you don't want to miss out hit the follow.
    * So if you want to improve your _______ I share practical tips every single week, so hit that follow.
    * So if you are ready to ______ and still hit your goals, hit follow.

    **B. WTA Templates - COMMENT:**
    * Do you agree 👍 or disagree 👎 let me know below.
    * Which one do you prefer A or B let me know below.
    * If you want to (SOLVE COMMON PROBLEM) drop a (CHOOSE AN EMOJI YOU LIKE) in the comments.
    * On a 0-10 scale! How helpful was this video? Let me know in the comments!
    * And if you want to know how to (ACHIEVE SPECIFIC DESIRED OUTCOME), comment: (WORD).
    * … let me know what you think!
    * But I'd love to hear your thoughts: (Question)?
    * So the question is: Should _____ or not?
    * Let me know if I'm missing something.
    * And I would love to hear from you: Is this _____ that you would _____?

    **C. WTA Templates - COMMENT THE WORD:**
    * … and if you are still confused about ____ comment the word "____" and I send you ____.
    * … and if you are simply tired of _____ comment the word "____" and let's chat.

    **D. WTA Templates - SHARE:**
    * Think of a friend who needs to know about this and tag them below.
    * Think of a friend who would benefit from this tip and go SHARE it.
    * Think of a friend who might be struggling with this and send them this video.
    * Think of someone who would find this tip helpful and tag them in the comments.
    * My goal is to help as many people as I can who struggle with _________ , so it would mean the world to me if you shared this video with a friend.

    **E. WTA Templates - SAVE:**
    * If you don't want to forget these tips you may want to add a bookmark.
    * If this was useful add this video to your favorites.
    * If you are like me who forgets stuff then bookmark this video for later.
    * Now I don't know about you but I easily forget stuff, so if you are like me then save this video to your favorites.
    * Save this video so you don't forget it.

    **F. Mid-Video WTA for SAVE:**
    * You may want to save this for later.
    * You may want to Bookmark this video so you can come back to it.
    * You may want to watch this video again so add a bookmark.
    * (Display useful info on the screen) Take a screenshot, or you can just bookmark this video for later.

**II. Engaging Question Templates:**

    **1. Identity-Driven Questions:**
    * "Do you see yourself as someone who values connection or perfection?"
    * "Are you the kind of person who prioritizes engagement or creativity when posting?"
    * "Do you create content to express yourself or to grow an audience?"
    * "Would you describe yourself as a consistent creator or someone who posts when inspired?"
    * "Is making videos something you do for fun or for results?"

    **2. Validation-Seeking Questions:**
    * "Have you ever felt stuck after posting a lot but not seeing any growth?"
    * "Have you noticed that posting consistently doesn't always mean more engagement?"
    * "Did you ever think about quitting after putting in so much effort with no response?"
    * "Have you ever posted a video you thought was great, only to get no views?"
    * "Have you tried using personal stories in your content, and how did it go?"

    **3. Contrarian or Polarizing Questions:**
    * "Is perfect editing really necessary to grow on TikTok?"
    * "Do you think creators should stop worrying about going viral and focus on real connection?"
    * "Is using trending sounds overrated for engagement?"
    * "Do you believe that a relatable creator is better than a polished one?"
    * "Is it better to post daily content or only when you have something valuable to share?"

    **4. Tough Choice Questions:**
    * "Would you rather post a video that looks amazing but gets no engagement, or a rough one that goes viral?"
    * "Would you focus more on your content looking professional or feeling authentic?"
    * "If you had to pick, would you rather have more views or more comments?"
    * "Would you prefer consistent growth or occasional viral spikes?"
    * "If you could only improve one thing about your videos, what would it be?"

    **5. 'What Would You Do?' Questions:**
    * "What would you do if your engagement dropped to zero tomorrow?"
    * "What's the first thing you'd change if your account wasn't growing?"
    * "How would you approach content differently if views didn't matter?"
    * "What's your next step if your videos aren't getting comments?"
    * "If you could redo your last video, what would you change?"

    **6. Future-Oriented Questions:**
    * "What's one thing you want to improve about your content this year?"
    * "How do you see your content evolving in the next few months?"
    * "Where do you want your account to be 6 months from now?"
    * "What's one new strategy you want to try to boost engagement?"
    * "If you could achieve one big goal with your content, what would it be?"`;
    const conversationalPhrasesList = `**Conversational Phrases & Engagement Techniques**

**I. The Power of "YOU" (Making Videos More Natural):**
‼️ You can make your videos sound more natural if you just start using the word 'YOU' more often! I am using that word in these sentences too. Why? Because I want you to feel like I am just sharing with you a simple tip that will really help you to connect with your viewers on a deeper level. You will make them feel like that they know you and that you are talking directly to them. You can try this in your next video! 😉

**II. Phrases to Place Before the GOLDEN NUGGET:**
* So here is something you can try.
* So here is one simple thing you can try.
* So the next time you ______ try ______.
* So what can you do?
* And I know you are probably asking: How can I ______? Well, there is a simple answer to that.

**III. RELATABLE - Phrases to Create a Feeling of Relatability:**
* You know when you…
* You know those ______ everyone is using for their _________
* When you ____________ What do you do?
* You must have seen…
* You must have heard before…
* You might say, (insert your name) that's easy to say but…
* I don't know about you but whenever I…
* Now if you are like me you must feel ____ whenever ____
* If you're anything like me, you've probably experienced...
* I can't be the only one who's noticed that...
* Have you ever found yourself in a situation where...
* Imagine, just for a second, you were in the position to...
* It's not uncommon to feel ___ when ___; I know I certainly have...
* Now, if you've ever felt ____ during ____, you're not alone. I feel that way all the time.
* I'm sure you've been in a place where you felt...
* We've all been there, that moment when you...
* I bet you're familiar with this scenario...
* Think about the last time you….
* You may be someone who….
* So what do you do when…?
* I don't know if you have ever experienced this….
* But then what happens is…

**IV. QUESTIONS - Using Questions to Make Videos More Engaging:**
* Have you ever…
* Have you ever…. and thought to yourself:
* Have you ever been in a situation where…
* Have you ever seen one of those…
* Ever wondered why…
* Can you remember a time when you…
* Can you think of a moment when you felt…"
* Can you remember a time when you found yourself…"
* Ever noticed how sometimes…"
* Ever found yourself in the middle of…
* You probably want to know how ______
* Do you have any idea how _____

**V. CURIOSITY - Phrases to be Added After the HOOK:**
* and here is why
* and here is how
* and I'll tell you why
* and do you know why?
* Here is what you need to know
* Let me explain
* and I am going to tell you exactly why
* And it's not for the reasons you think.
* You won't believe why.

**VI. Experiences (Relating to Viewer Experience):**
* Think about the last time you….

**VII. Expressions (Common Conversational Connectors & Phrases):**
* Think about the last time you…. (Note: Repeated from "Experiences", included as per original)
* You may be someone who….
* If you are serious about….
* I'm just here to remind you of the obvious…
* So think of it this way…
* And by the way…
* If you think…`;

    const fullPrompt = `Role:
You are an expert AI Scriptwriting Assistant and Conversational Content Strategist. You specialize in creating highly engaging, human-sounding, and value-driven short-form video script components that meticulously adhere to a specific, proven scripting methodology. Your goal is to empower users to assemble outstanding video scripts.

Instruction:
Your primary task is to generate a comprehensive set of modular video script components following the PRIMARY SCRIPT FLOW structure. This generation MUST be based on the provided "Video Idea" and "Research Analysis Text".

PRIMARY SCRIPT FLOW (Generate exactly 5 options for each component in this order):
1. **Hook** (5 options)
2. **Bridge** (5 options) 
3. **Golden Nugget** (5 options)
4. **Why To Act (WTA)** (5 options)

CRITICAL: You MUST thoroughly study, internalize, and apply ALL principles, styles, and examples detailed in the "Guiding Documents" (provided in the Context section) to EVERY piece of content you generate. This is paramount for success.

Output Requirements:
1.  **JSON Format:** Your entire output MUST be a single, valid JSON object. Strictly adhere to the JSON \`responseSchema\` provided in the Context.
2.  **Component Richness & Completeness:**
    * Generate EXACTLY 5 distinct options for each of the 4 primary components.
    * Ensure ALL generated components are substantial, creative, distinct, and directly usable.
    * Avoid empty strings, placeholder content, or incomplete components within any part of the JSON structure.
3.  **Stylistic Adherence (MANDATORY - Refer to Guiding Documents):**
    * **Conversational & Personal Tone:** Write as if speaking directly to ONE person ("you"). Use simple, everyday language. The tone should be friendly, relatable, and empathetic. Avoid formal, academic, presentational, or robotic language. (Directly apply "Humanization Principles" esp. 1, 2, 3, 7, 9).
    * **Value First:** Every component must contribute to delivering clear, tangible value to the viewer. The "Golden Nugget" is central to this, but all parts should support it. (Reference "Scripting Style Explanation" regarding value, 90/10 rule).
    * **Engagement is Key:** Actively use micro-hooks (inspired by the "Micro-Hook Examples List" and relevant sections of the "Scripting Style Explanation") and engaging questions (inspired by "Conversational Phrases List") to maintain viewer interest throughout the script. (Directly apply "Humanization Principle 8").
    * **Clarity and Simplicity:** The message must be exceptionally easy to understand for a broad audience.
    * **Humanization:** Consistently apply all "Humanization Principles" to make the script sound natural, authentic, and relatable.

4.  **Component Generation - Specific Guidelines (Always cross-reference with "Guiding Documents"):**

    * **Hooks (Generate exactly 5 distinct options):**
        * **Purpose:** Instantly grab attention (target the first 3 seconds). Clearly identify who the video is for and the core problem/topic. Spark significant curiosity.
        * **Style:** Place essential keywords as close as possible to the *beginning* of the hook. (Reference "Scripting Style Explanation" for Hook structure and "Humanization Principle 5"). Utilize or adapt phrases from the "Curiosity Phrases" section within the "Conversational Phrases List."
        * **Format:** Each hook should be 2-4 short, impactful lines. Provide a \`title\` for each hook.

    * **Bridges (Generate exactly 5 distinct options):**
        * **Purpose:** Connect with the audience by addressing their frustrations, desires, and objections. Build rapport and make the viewer feel deeply understood and validated.
        * **Style:** Empathetic, relatable. Can incorporate subtle, appropriate humor. (Reference "Scripting Style Explanation" for Bridge elements).
        * **Format:** 1-2 concise, impactful sentences. Provide a \`title\` for each bridge.

    * **Golden Nuggets (Generate exactly 5 distinct options):**
        * **Purpose:** Deliver the core solution, the main piece of value, or the crucial first step the audience can take. This is the primary takeaway of the video.
        * **Style:** Emphasize that the solution is "easier than they think." Use very simple, clear, and direct language. This component should embody the "90% value" principle. (Reference "Scripting Style Explanation" for Golden Nugget details and the "Phrases to place before the GOLDEN NUGGET" section in the "Conversational Phrases List").
        * **Format:** 1-2 concise, highly impactful sentences. Provide a \`title\` for each golden nugget.

    * **Why To Act - WTAs (Generate exactly 5 distinct options):**
        * **Purpose:** Serve as compelling calls to action or concluding thoughts that encourage specific viewer engagement or action based on the video's content. Provide a clear reason and "what's in it for them" (WIIFT) to act.
        * **Style:** Adopt an "abundance mindset" – you have more value to give. Avoid sounding demanding or generic (e.g., "follow for more"). Place action keywords (follow, comment, share, save, etc.) towards the *end* of the sentence or phrase. Attempt to blend the WTA smoothly with the preceding content, potentially using "and" as a connector. (Reference "Scripting Style Explanation" for WTA strategy).
        * **Inspiration:** Actively use and adapt the provided "WTA Templates List" for Follow, Comment, Share, and Save, tailoring them to the specific video topic and desired action.
        * **Format:** 1-3 short lines. Provide a \`title\` for each WTA option and specify the \`actionType\` (follow, comment, share, save, like).

Context:
You will be provided with and MUST base your generation on the following:

1.  **JSON \`responseSchema\` (Your output MUST conform to this):**
    \`\`\`json
    ${JSON.stringify(responseSchema, null, 2)} 
    \`\`\`

2.  **Guiding Documents (These are your primary source for style, tone, and content generation techniques):**

    * **Document 1: Core Scripting Style Explanation (User's Method Transcript):**
        \`\`\`text
        ${scriptingStyleTranscript}
        \`\`\`

    * **Document 2: Humanization Principles (Sentence Transformation Principles):**
        \`\`\`text
        ${humanizationPrinciples}
        \`\`\`

    * **Document 3: Micro-Hook Examples List:**
        \`\`\`text
        ${microHookExamplesList}
        \`\`\`

    * **Document 4: WTA (Why To Act) Templates List:**
        \`\`\`text
        ${wtaTemplatesList}
        \`\`\`

    * **Document 5: Conversational Phrases & Curiosity Kickers List:**
        \`\`\`text
        ${conversationalPhrasesList}
        \`\`\`

3.  **User Inputs (These will be specific to each generation request):**
    * **Video Idea:** "${videoIdea}"
    * **Research Analysis Text:** "${researchAnalysisText}"

Generate exactly 5 options for each component following the PRIMARY SCRIPT FLOW order: Hooks → Bridges → Golden Nuggets → WTAs.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any, // Cast as any to satisfy type, schema structure is validated by Gemini
        temperature: 0.75, // Slightly increased for more varied creative options
      } as GenerationConfig,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // console.log("Full prompt for script components:", fullPrompt); // For debugging
    
    // Calculate input token count for cost estimation
    const estimatedInputTokens = estimateTokenCount(fullPrompt);
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    if (response.text()) {
      try {
        const jsonData: ScriptComponents = JSON.parse(response.text());
        // Validate that all required component arrays exist, even if empty, as per schema
        if (jsonData.hooks === undefined || jsonData.bridges === undefined || jsonData.goldenNuggets === undefined || jsonData.wtas === undefined) {
            throw new Error("Malformed JSON structure: Missing one or more required component arrays (hooks, bridges, goldenNuggets, wtas).");
        }
        
        // Calculate output token count and costs
        const estimatedOutputTokens = estimateTokenCount(response.text());
        const costInfo = calculateCost(estimatedInputTokens, estimatedOutputTokens);
        
        // Log cost information for monitoring
        console.log('🔥 Script Components Generation Cost:', {
          timestamp: new Date().toISOString(),
          videoIdea: videoIdea.substring(0, 50) + '...',
          ...costInfo
        });
        
        return NextResponse.json({
          ...jsonData,
          _metadata: {
            costInfo,
            generatedAt: new Date().toISOString(),
            promptLength: fullPrompt.length,
            responseLength: response.text().length
          }
        }, { status: 200 });
      } catch (parseError: any) {
        console.error("Failed to parse Gemini response as JSON:", parseError.message);
        console.error("Gemini raw response text:", response.text());
        return NextResponse.json({ message: "Failed to parse script components from AI response.", rawResponse: response.text(), errorDetails: parseError.message }, { status: 500 });
      }
    } else {
      console.error("Gemini response was empty or blocked. Candidate:", response.candidates?.[0]);
      const blockReason = response.candidates?.[0]?.finishReason;
      const safetyRatings = response.candidates?.[0]?.safetyRatings;
      const promptFeedback = response.promptFeedback;
      return NextResponse.json({ 
        message: "Received no valid response from AI for script components.", 
        blockReason: blockReason,
        safetyRatings: safetyRatings,
        promptFeedback: promptFeedback
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API Route Error - generate-script-components]', error);
    return NextResponse.json({ message: 'Failed to generate script components', error: error.message || error.toString() }, { status: 500 });
  }
} 