const geminiService= require('../services/geminiService');
const firestoreService = require('../services/firestoreService');
const { where } = require("firebase/firestore");

const generatorRole=  `
        Your role is called the generator. You will be given a piece of text. You must assess the sentiment of the provided text to understand 
        whether it is constructive or harmful. This is ultimately to determine if the content is safe for an online platform used for professional online posts
        where users may discuss careers, seek clarifications about technology and challenges they are facing or simply encourage others. Criticism is welcomed only 
        when it is constructive in nature, where there is clear intent to help and there are clear areas highlighted for improvement.`;

const generatorTaskExplanation= `
        You may find a piece of text to be overly critical, offensive, sexist, racist, insulting, toxic or others. Alternatively, you may find the
        text to be positive, helpful, supportive, motivating, encouraging or others. Once you have assessed the sentiment of the text you should output the answer
        based on the provided options, or using another adjective that fits into the 2 classes mentioned. Additionally, you should come up with a certainty index 
        (from 0-100, with 0 being unable to assess and 100 being extremely certain to indicate how certain you are about an answer. 
        You are also meant to provide a negativity index from 0-100. 0-25 Strongly positive, 26-50 moderate positivity/neutral/constructive criticism
        51-75 negative comment with little construcitve criticism and insight,76-100 mean , offensive, hateful or overly negative content.  
        Think out each element step-by-step. The following is an example of how to assess a piece of provided text 

        Example text: You are a horrible person for having this opinion. I think you should stop posting on this platform
        
        Example output: 

        {   "InitialText":"You are a horrible person for having this opinion. I think you should stop posting on this platform"
            "ThinkingProcess": "The text contains a direct personal attack ('You are a horrible person') and discourages the individual from engaging in the platform. There is no constructive criticism, only an attempt to shame or silence the poster. The language used is clearly negative and has no supportive or neutral elements. Given these factors, the comment leans towards being offensive and discouraging rather than providing meaningful discussion.",
            "NegativityIndex": 85,
            "NegativityIndexExp": "The statement is highly negative due to the personal insult and the suggestion that the individual should stop posting. It does not offer any constructive feedback but rather aims to demean the person. The language used ('horrible person') is strong and explicitly critical in an unproductive way.",
            "CertaintyIndex": 100,
            "CertaintyIndexExp": "The sentiment of the text is unambiguously negative. The wording and intent are clear, making it easy to categorize. There are no neutral or positive aspects to the statement, which increases certainty in the classification.",
            "Flag": "yes"
        }

        ` ;
const generatorFormatInstuctions=`The output must only be in a JSON format and nothing else. The following items should be included in the JSON: 
                            1. InitialText. Provide the initial piece of content that you are analysing. 
                            2. ThinkingProcess. Think through your considerations step by step and highlight the main considerations when coming to an answer. 
                            3. NegativityIndex (only provide an postive integer from 0-100 without any text for this item)
                            4. NegativityIndexExp. Explain your reasoning step by step for why you chose the negativity index.
                            5. CertaintyIndex. (only provide an postive integer from 0-100 without any text for this item)
                            6. CertaintyIndexExp. Explain your reasoning step by step for why you chose this value for the certainty index.
                            7. Flag. (opitions: yes/no) Decide if the post should be flagged.
                            `;



const discriminatorRole =  `Your role is to be a discriminator. This means that you will evaluate the output of another model and check for any flaws or errors in 
                            judement. The text that was evaluated by the model and output will be provided to you. This for a sentiment analysis system where the 
                            sentiment of provided text is assessed and analysed to see if it's constructive or harmful. The input text is always user generated 
                            text on a professional online platform, where users may discuss careers, seek clarifications about technology and challenges they are 
                            facing or simply encourage others. Criticism is welcomed only when it is constructive in nature, where there is clear intent to help 
                            and there are clear areas highlighted for improvement `;
                        
const discriminatorTaskExplanation= `You are meant to assess the output of another model performing sentiment anlysis. The output provided by the model 
                                     will be in the form of a JSON and will contain the following items:
                                     
                                        1. InitialText: The text that the model analysed
                                        2. ThinkingProcess. The main considerations and thinking process of the previous model. 
                                        3. NegativityIndex (a postive integer from 0-100 without any text for this item) A measure of the negativity of a piece of text
                                        4. NegativityIndexExp. The previous models explanation for the negativity index
                                        5. CertaintyIndex. (a postive integer from 0-100 without any text for this item). A measure of how certain the model was about their answer
                                        6. CertaintyIndexExp. The previous model's explanation for for the certainty index
                                        7. Flag. (options: yes/no) The previous model's decision for if the post should be flagged. 
                                     
                                     After completing your assessment based on the items above you must provide an output that explains what you agree with and what 
                                     you disagree with. You should break down your thought process and explain it in steps. Look for flaws in judgement or basic errors. 
                                     The most important thing to assess is the flag based on your assessment. You should provide a recommendation for if the post should be
                                     flagged or not. 

                                     Example input you will be asked to assess: 

                                        {   "InitialText":"You are a horrible person for having this opinion. I think you should stop posting on this platform"
                                            "ThinkingProcess": "The text contains a direct personal attack ('You are a horrible person') and discourages the individual from engaging in the platform. There is no constructive criticism, only an attempt to shame or silence the poster. The language used is clearly negative and has no supportive or neutral elements. Given these factors, the comment leans towards being offensive and discouraging rather than providing meaningful discussion.",
                                            "NegativityIndex": 85,
                                            "NegativityIndexExp": "The statement is highly negative due to the personal insult and the suggestion that the individual should stop posting. It does not offer any constructive feedback but rather aims to demean the person. The language used ('horrible person') is strong and explicitly critical in an unproductive way.",
                                            "CertaintyIndex": 100,
                                            "CertaintyIndexExp": "The sentiment of the text is unambiguously negative. The wording and intent are clear, making it easy to categorize. There are no neutral or positive aspects to the statement, which increases certainty in the classification.",
                                            "Flag": "yes"
                                        }

                                    Example of an output corresponding to the above example that you should produce:
                                        {
                                            "ThinkingProcessAssessment": "The previous model correctly identified that the text contains a direct personal attack ('You are a horrible person') and that it discourages engagement on the platform. The reasoning that the statement lacks constructive criticism and is solely aimed at shaming the recipient is valid. The NegativityIndex of 85 is reasonable given the strong language and its unproductive nature. The explanation provided aligns with the score, as the statement is both demeaning and non-constructive. The CertaintyIndex of 100 is justified since the text is explicitly negative without any ambiguity. Given that the platform prioritizes constructive criticism and discourages harmful speech, the decision to flag the comment as inappropriate is well-founded.",
                                            "Flag": "yes",
                                            "flagExplanation": "The text contains a personal attack that serves no constructive purpose and discourages participation. The phrase 'You are a horrible person' is explicitly harmful and does not provide any room for improvement or discussion. Furthermore, telling someone to stop posting is an attempt to silence them rather than engage in meaningful discourse. Given the platform's guidelines emphasizing constructive feedback, this post is inappropriate and should be flagged."
                                        }
                                    `;              

const discriminatorFormatInstuctions= `Your output should be in the form of a JSON only. Include the following items in the JSON: 
                                        1. ThinkingProcessAssessment: As a whole breakdown your assessment of the previous model's thinking 
                                                                      process in a step by step process across all items. 
                                        2. Flag: (options: yes/no , don't include any other text for this item) To to best of your abilities decide whether the post should be flagged 
                                                 based on your assessment of the previous model's output. 
                                        3. flagExplanation: Breakdown your thought process for why the content should be flagged. 
                                        `;

//requires 'text', 'contentID', 'postType','commentID' as queries. 
// ContentID is the docID of the selected content. 
const getGeneratorOutput = async (req ,res, next) => {
    try{

        console.log("req.query.text@:getGeneratorOutput ",req.query.text);

        if (!req.query.text) {
            return res.status(400).json({ error: "Missing 'text' query parameter" });
        }

        const prompt = `${generatorRole} + ${generatorTaskExplanation} + ${generatorFormatInstuctions} 
        + analyse this based on instructions given : ${req.query.text} `;
        
        const geminiOutput = await geminiService.gemini15Flash.generateContent(prompt);
        console.log("result@getGeneratorOutput: ", geminiOutput.response.text());
        req.generatorOutput= geminiOutput.response.text();
        next();

    }catch(e){
        console.error("error occured during gemini 1.5 Flash call: ", e);
        next(e);
    }
};

const getDiscriminatorOutput = async (req, res, next) => {
    try{
        const prompt = `${discriminatorRole} + ${discriminatorTaskExplanation} + ${discriminatorFormatInstuctions} 
        + analyse the following based on instructions given : ${req.generatorOutput} `;  
        const geminiOutput = await geminiService.gemini20flash.generateContent(prompt); 
        const discriminatorOutput = geminiOutput.response.text();
        console.log("result@getDiscriminatorOutput: ", discriminatorOutput);
        req.discriminatorOutput=discriminatorOutput;
        next();

    }catch(e){
        console.error("An Error occured while calling gemini 2.0 flash : ",e );
        next(e);
    }
}

const parseFlag = async (req, res, next) => {
    //who's JASON and why can't my code parse him :sad
    try{
        const cleanedJsonString = req.discriminatorOutput.replace(/^```json\s*|```$/g, '');
        const flag=JSON.parse(cleanedJsonString).Flag;
        console.log("req.discriminatorOutput@parseFlag: ",flag); 
        if (flag == 'yes'){
            next();
        }else{
            res.status(200).send(flag);
        }
        
    }catch(e){
        console.error("An error occured while flagging the comment on firebase: ",e );
        next(e);
    }
}

const writeFlag = async (req, res, next) => {
    try{

        //handle requests that don't include complete information
        if (!req.query.postType || !req.query.contentID){
            res.status(400).send("Request is missing postType or ContentID");
        }

        if ((req.query.postType == "postComment" || req.query.postType == "threadComment" ) && !req.query.commentID){
            res.status(400).send("Request is missing post commentID");
        }

        const contentType =req.query.postType;
        const contentID = req.query.contentID;
        let commentID =""; 

        if(contentType=='post'){

            //content ID is the unique identifier for a piece of content, it's the docID for that piece of content. The docID listed in flags, is the docID for the flags, not the content. 
            //what am I saying anyway
            const { authorId } = await firestoreService.firebaseRead(`posts/${req.query.contentID}`, next); 

            const newPostFlag = {
                authorID : authorId,
                contentID : req.query.contentID,
                contentType : contentType,
            }
            
            await firestoreService.firebaseCreate(`flags`, newFlag, next);
            res.status(200).send("post has been added to list of flagged content.");

        }else if (contentType=='postComment'){

            commentID = req.query.commentID;
            const { comments } = await firestoreService.firebaseRead(`posts/${req.query.contentID}`, next);

            if (!comments){
                res.status(400).send('Post comment not found');
            }else{
            
                const postCommentAuthorID = comments.find(c => c.commentID == req.query.commentID).authorID;

                newPostCommentFlag = {
                    authorID : postCommentAuthorID,
                    contentID : contentID,
                    commentID : commentID,
                    contentType : contentType,
                } 

                await firestoreService.firebaseCreate(`flags`, newPostCommentFlag, next);
                res.status(200).send("post comment has been added to list of flagged content.");

            }
            
        }else if (contentType=='thread'){

            const { authorId } = await firestoreService.firebaseRead(`threads/${req.query.contentID}`, next); 

            const newThreadFlag = {
                authorID : authorId,
                contentID : req.query.contentID,
                contentType : contentType,
            }
            
            await firestoreService.firebaseCreate(`flags`, newThreadFlag, next);
            res.status(200).send("post has been added to list of flagged content.");

        }else if (contentType=='threadComment'){

            commentID = req.query.commentID;
            const { comments } = await firestoreService.firebaseRead(`threads/${req.query.contentID}`, next);

            if (!comments){
                res.status(400).send('Thread comment not found');
            }else{
            
                const threadCommentAuthorID = comments.find(c => c.commentID == req.query.commentID).authorID;

                newThreadCommentFlag = {
                    authorID : threadCommentAuthorID,
                    contentID : contentID,
                    commentID : commentID,
                    contentType : contentType,
                } 

                await firestoreService.firebaseCreate(`flags`, newThreadCommentFlag, next);
                res.status(200).send("Thread comment has been added to list of flagged content.");

            }

        }

        


    }catch(e){
        console.error(e);
        next(e);
    }
    
    
}

module.exports= {
    getGeneratorOutput, getDiscriminatorOutput, parseFlag, writeFlag
};

