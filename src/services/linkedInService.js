const axios= require ('axios');

const clientId= process.env.linkedInClientId;
const clientSecret= process.env.linkedInClientSecret; 
const redirectURI= process.env.linkedInRedirectURI; 
const sam= "sammy";

//send a request to sync with linkedin. This process involves redirecting to the likedin auth page to obtain a code is used for the next function. 
//w_member_social scope is used to request post access
const startLinkedInAuth= (req, res ) => { 
    const encodedRedirectURI = encodeURIComponent(redirectURI); // URL encode redirect URI
    // authUrl= `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectURI}&scope=w_member_social`;
    authUrl='https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=867jokcr49viin&redirect_uri=http://localhost:4001/auth/linkedin/callback&scope=w_member_social';
    res.redirect(authUrl);
}



//exchange code obtained from auth for access token
const getAccessToken= async (req, res, next) => {
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

         //next step would be to save this token in firebase.
        console.log(accessTokenResponse.data);
        return accessTokenResponse.data;

    } catch (error){
        next(new Error("Failed to get access token: " + error.message));
    }

   
};

module.exports= {
    startLinkedInAuth, getAccessToken
};
