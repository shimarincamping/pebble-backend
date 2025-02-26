const axios= require ('axios');
const firestoreService = require('../services/firestoreService');

const clientId= process.env.linkedInClientId;
const clientSecret= process.env.linkedInClientSecret; 
const redirectURI= process.env.linkedInRedirectURI; 
const encodedRedirectURI = encodeURIComponent(redirectURI);

//send a request to sync with linkedin. This process involves redirecting to the likedin auth page to obtain a code is used for the next function. 
//w_member_social scope is used to request post access
const startLinkedInAuth= (req, res ) => { 
    const encodedRedirectURI = encodeURIComponent(redirectURI); // URL encode redirect URI
    authUrl= `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectURI}&scope=w_member_social%20openid%20profile`;
    // authUrl='https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=867jokcr49viin&redirect_uri=http://localhost:4001/auth/linkedin/callback&scope=w_member_social';
    res.redirect(authUrl);
}



//exchange code obtained from auth for access token
const handleAccessToken= async (req, res, next) => {
    const code=req.query.code;

    //redirects user back to pebble. 
    res.status(200).redirect('http://localhost:3000/feed');
    try{
        const accessTokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken",null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectURI,
                client_id: clientId,
                client_secret: clientSecret
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

         //requires firebase storage
         //1. store token
        console.log(accessTokenResponse.data);
        next();
        return accessTokenResponse.data;
       

    } catch (error){
        next(new Error("Failed to get access token: " + error.message));
    }

   
};

 const handleLinkedInId = async(req, res) => {
    
    const ACCESS_TOKEN='AQXCy3dKCOTxpI4PXAK2ZY5g7v_5dVa-nOWl1ZTMZDzE9ZoEfocA-mqz6QRalLKGBuriLrsEFsDxqmY0KwuDCkD0VeIDiBq2hwzNwipkiY3gbTEEWhtzHzFcrNyUMNGCJ7HxnVWoeEAr2ORoeQypVLLxYgXiTaeUhOdtyWGjmdI1lwqeOX7700TEHaaqvYSm_2JRAiIO2l35b9xjFJPqdu3_hgIjI3CvqDZKWKxWZ-QDOi0HlNwKjvsYO_e_e4okkep40gwXMCrhp9qWJQGTb7Ydrg6zIHMF5YktBpcgDl2ZNzOYEZ9EeemsgqTN1wnF9cT3qb6cbPNlxyOxeapppvpinmKoww';
    const ACCESS_TOKEN_WITH_OPENID='AQWTGHzuVH1aTjhMm7wr3qMVSdm_IgIQcP7pon5UqadxYnWtg7OtEZaEHEAXlnwX3SFVWz4hAJEDIfX9kucU-2LXKFbYY5hibBh91HJY92wbG42Gc6tJyiAEcCsi6kSpjo0TPqJozFTkTlO1rs67bpkJ33aKYroeWXeqD-qJQbEZcnelzqZEMp1RvRwpF9sIobDtU9vnKtDDe6ZizAYerakcpM2Q3Ade06HXUknD8ipYgMf0LA98yJcikfo7HuxbR3LFzNz14BRnCbMzzgblfMobcVJHZ1eFr8L5EVSyl9z2KeHvbsOtRyqeUzwuO_O5WgzxJDTT4tqqhbRaC9H5HpcoCBvpYw';
    res.status(200);
    try {
        const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN_WITH_OPENID}`
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error("Error fetching LinkedIn profile:", error.response?.data || error.message);
    }

}

const syncPost = async (req, res, next) => {
    //should accept a get request
    //req should include userID (of the user sending this req), and postID of the post that should be synced.
    // ----> This should only be available for posts created by the user, the button should not appear otherwise. 

    //obtain the post data from firebase
    //1.double check that the post that should be linked was created by the user sending the req
    //2.Obtain user's access token
    //3.send a appropriate req to the linkedin api to create the post

    //copied from firebase
    //this should eventually be part of the query
    
    const { currentUser } = await firestoreService.firebaseRead(`users/${userID}`, next);
    
    if(req.query.userId && req.query.postId){
        const linkedinUserId='QCFcnUxM1v';
        try{
            //async function for obtaining data from firebase
            const reponse = await axios.post(
                'https://api.linkedin.com/v2/ugcPosts',

                {
                    author: `urn:li:person:${linkedinUserId}`,
                    lifecycleState: 'PUBLISHED',
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            shareCommentary: {
                                text:"test test test test test"
                            },
                            shareMediaCategory: "NONE"
                        }
                },
                    visibility: {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                },

                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-Restli-Protocol-Version': '2.0.0',
                        'Content-Type': 'application/json'
                    }

                }
            );
        } catch(e){
            console.log("Error occured while syncing post: " + e); 
        }

    }else{
        res.status(400).send('userId or postId not found');
    }
}

    const createPost= async (req, res)=> {
        const linkedinUserId='QCFcnUxM1v';
        const ACCESS_TOKEN_WITH_OPENID='AQWTGHzuVH1aTjhMm7wr3qMVSdm_IgIQcP7pon5UqadxYnWtg7OtEZaEHEAXlnwX3SFVWz4hAJEDIfX9kucU-2LXKFbYY5hibBh91HJY92wbG42Gc6tJyiAEcCsi6kSpjo0TPqJozFTkTlO1rs67bpkJ33aKYroeWXeqD-qJQbEZcnelzqZEMp1RvRwpF9sIobDtU9vnKtDDe6ZizAYerakcpM2Q3Ade06HXUknD8ipYgMf0LA98yJcikfo7HuxbR3LFzNz14BRnCbMzzgblfMobcVJHZ1eFr8L5EVSyl9z2KeHvbsOtRyqeUzwuO_O5WgzxJDTT4tqqhbRaC9H5HpcoCBvpYw';

        //async function for obtaining data from firebase
        const response = await axios.post(
            'https://api.linkedin.com/v2/ugcPosts',

            {
                author: `urn:li:person:${linkedinUserId}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text:"test test test test test"
                        },
                        shareMediaCategory: "NONE"
                    }
            },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            },

            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN_WITH_OPENID}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                    'Content-Type': 'application/json'
                }
            }
            
            );

        console.log(response); 
    }

    const postTest= async (req, res, next) => {
        try{
            const userID='3oMAV7h8tmHVMR8Vpv9B';
            const postID='7cLmdmo1IkazHx48qXiu';

            const { linkedInAccessToken, linkedInID } = await firestoreService.firebaseRead(`users/${userID}`, next);

            const { postDesc, postPicture ,title } = await firestoreService.firebaseRead(`posts/${postID}`, next);

            if (! linkedInAccessToken && linkedInID){
                authUrl= `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectURI}&scope=w_member_social%20openid%20profile`;
                // authUrl='https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=867jokcr49viin&redirect_uri=http://localhost:4001/auth/linkedin/callback&scope=w_member_social';
                console.log('access token or linkedin id not found');
                res.redirect(authUrl);

            }else{
                const reponse = await axios.post(
                    'https://api.linkedin.com/v2/ugcPosts',
    
                    {
                        author: `urn:li:person:${linkedInID}`,
                        lifecycleState: 'PUBLISHED',
                        specificContent: {
                            "com.linkedin.ugc.ShareContent": {
                                shareCommentary: {
                                    text:`${title}\\n ${postDesc}`
                                },
                                shareMediaCategory: "image"
                            }
                    },
                        visibility: {
                            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                        }
                    },
    
                    {
                        headers: {
                            'Authorization': `Bearer ${linkedInAccessToken}`,
                            'X-Restli-Protocol-Version': '2.0.0',
                            'Content-Type': 'application/json'
                        }

                    }
                );

            }
            res.send('success'); 

        }catch(e){
            console.log(e); 
        }
        
    }


module.exports= {
    startLinkedInAuth, handleAccessToken, syncPost , handleLinkedInId , postTest , createPost
};
