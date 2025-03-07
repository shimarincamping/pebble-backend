const firestoreService = require('../services/firestoreService');

const clientId= process.env.linkedInClientId;
const clientSecret= process.env.linkedInClientSecret; 
const redirectURI= process.env.linkedInRedirectURI; 
const encodedRedirectURI = encodeURIComponent(redirectURI);


const currentUserID='3oMAV7h8tmHVMR8Vpv9B';


//creates linkedin post if previously authenticated. Starts authentication process first otherwise
const startSync= async (req, res, next) => {
    try{
        // setTimeout(200); 
        //the following data should eventually be available from the request

        const postID='7cLmdmo1IkazHx48qXiu';

        const { linkedInAccessToken, linkedInID } = await firestoreService.firebaseRead(`users/${currentUserID}`, next);
        const { postDesc, postPicture ,title } = await firestoreService.firebaseRead(`posts/${postID}`, next);
        console.log("at the top of startSync:\n\n linkedInAccessToken: ",linkedInAccessToken,"\nlinkedInID: ",linkedInID,"\n\n")

        
        if (!linkedInAccessToken || !linkedInID){

            //send a request to sync with linkedin. This process involves redirecting to the likedin auth page to obtain a code is used for the next function. 
            //w_member_social scope is used to request post access
            authUrl= `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectURI}&scope=w_member_social%20openid%20profile`;
            res.redirect(authUrl);

        }

        console.log("post creation path initiated");
        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${linkedInAccessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: `urn:li:person:${linkedInID}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text: `${title} \n ${postDesc}`
                        },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            })
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.statusText}`);
        }

        res.send('success'); 

    }catch(e){
        console.log(e); 
    }
    
}

//exchange code obtained from auth for access token
const handleAccessToken = async (req, res, next) => {
    try{
        //linkedin api URI is set to this path. The code used to obtain the access token is part of the query sent by linkedin
        const code=req.query.code;

        //Redirects user's on the linkedin auth page back to pebble. 
        res.status(200).redirect('http://localhost:3000/feed');


        const accessTokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectURI,
                client_id: clientId,
                client_secret: clientSecret
            }),
            
        });

        if (!accessTokenResponse.ok) {
            throw new Error(`Failed to fetch access token: ${accessTokenResponse.status}`);
        }

        const accessTokenData = await accessTokenResponse.json();

        await firestoreService.firebaseWrite(
            `users/${currentUserID}`,
            { "linkedInAccessToken" : accessTokenData.access_token},
            next
        );

        console.log("\n\naccess token\n\n",accessTokenData.access_token);
        next();

    } catch (error){
        next(new Error("Failed to get access token: " + error.message));
    }
};

 const handleLinkedInId = async(req, res ,next) => {

    const { linkedInAccessToken } = await firestoreService.firebaseRead(`users/${currentUserID}`,next);

    console.log("\n\nlinkedin Access Token @handleLinkedinID: ",linkedInAccessToken,"\n\n")   
    
    try {
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${linkedInAccessToken}`
            }
        });

        if (!profileRes.ok) {
            throw new Error(`Failed to fetch LinkedIn profile: ${profileRes.status}`);
        }

        const profileData = await profileRes.json();

        console.log("\n\n\n response from handleLinkedInID: \n\n\n",profileData);

        firestoreService.firebaseWrite(
            `users/${currentUserID}`,
            { "linkedInID" : profileData.sub },
            next
        );

        next();

    } catch (error) {
        console.error("Error fetching LinkedIn profile:", error.userInfoAPIRes?.data || error.message);
    }
}

    


module.exports= {
     handleAccessToken, handleLinkedInId , startSync
};
