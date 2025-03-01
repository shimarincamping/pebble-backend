const firestoreService = require('../services/firestoreService');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_Key=process.env.linkedinAPIKey;

const gemini = new GoogleGenerativeAI(API_Key);
const gemini15Flash = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });



generatorRole=  `Your role is called the generator. You will be given a piece of text. You must assess the sentiment of the provided text.
                 This ultimately to determine if the content is safe for an online platform`;
                 
generatorTaskExplanation= `
        For instance, you may find a piece of text to be overly critical, offensive, sexist, racist, insulting, toxic or others. Alternatively, you may find the
        text to be positive, helpful, supportive, motivating, encouraging or others. Once you have assessed the sentiment of the text you should output the answer
        based on the provided options, or using another adjective that fits into the 2 classes mentioned. Additionally, you should come up with a certainty index 
        (from 0-100, with 0 being unable to assess and 100 being extremely certain to indicate how certain you are about an answer. 
        You are also meant to provide a negativity index from 0-100. 0-25 Strongly positive, 26-50 moderate positivity/neutral/constructive criticism
        51-75 negative comment with little construcitve criticism and insight,76-100 mean , offensive, hateful or overly negative content.  
        Think out each element step-by-step. The following is an example of how to assess a piece of provided text 

        Example text 1: This post is useless and disgusting, nobody is going to find any value from it. What a waste of space.
        
        Example negativity index for text 1: 76.
        Example assessmenet for text 1: This post is overly negative and cynical. It does nothing to help the person improve but itstead intends to discourge and 
        make the poster feel bad. 
        
        Example certainty index for text 1 : 100. 
        
        Example explanation for certainty index for text 1 : Maximum confidence. The sentiment of this text is clear because the entire 
        sentence is negative, the language used is common in discouraging or offensive posts and there is no attempt from the author of this text to be positive

        Example flag for text 1: yes. 

        ` ;
generatorFormatInstuctions=`The output must be in a JSON format. The following items should be included in the JSON: 
                            1. ThinkingProcess. Think through your considerations step by step and highlight the main considerations when coming to an answer. 
                            2. NegativityIndex (only provide an postive integer from 0-100 without any text for this item)
                            3. NegativityIndexExp. Explain your reasoning step by step for why you chose the negativity index.
                            4. CertaintyIndex. (only provide an postive integer from 0-100 without any text for this item)
                            5. CertaintyIndexExp. Explain your reasoning step by step for why you chose this value for the certainty index.
                            6. Flag. (opitions: yes/no) Decide if the post should be flagged.
                            `;
const prompt = `Role`; 
    