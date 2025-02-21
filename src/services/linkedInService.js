const axios= require ('axios');

const clientId= process.env.linkedInClientId;
const clientSecret= process.env.linkedInClientSecret; 

//URI has not been added in .env file
const redirectURI= process.env.linkedInRedirectURI; 

//send a request to sync with linkedin

async function getAcessToken(code){
    try{
        const response = await axios.post("https://www.linkedin.com/oauth/v2/accessToken",null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

    } catch (error){
        throw new Error("Failed to get access token: " + error.message);
    }

    return response.data;
}