const geminiService= require('../services/geminiService');
const firestoreService = require('../services/firestoreService');
const { where } = require("firebase/firestore");

const role = `  You are a CV generator that creates custom CV templates for students based on a provided job description and additional information about the student. `;

const instructions = `
Information about the student and a job description the CV will be used for will be provided. The provided information can come in the form of profile data 
which may include things like, education, achievements, certifications, courses and other relevant items. Additionally, information may also be provided in 
the form on an array of posts the user has created on a website.The posts would be in the json format. The posts would likely talk about things that they 
have achieved, competitions they have joined, ideas they may have and so on. This information comes from a professional online platform called 'Pebble'. 
As long as it's relevant, you may use any of this profile or post information. All language used in the CV should be professional and well mannered. 
Long passages of text should be avoided to prioritize bullet points whenever possible. The CV should always be worded to advocate for the user and show them 
in the best possible light. This CV should be tailored based on the provided job description. In the event that there is insufficient information for a section 
you are allowed to use clearly indicate what the student should fill into that section with placeholder text. 

Adhere to the following guidelines when applicable: 

Contact Information:
Full Name
Phone Number
Professional Email Address
LinkedIn Profile URL (customized, if possible)

Summary/Profile :
A brief, concise overview of your qualifications and career goals.
Incorporate relevant keywords.
Tailor this section to each job you apply for.

Skills : 
Create a dedicated skills section.
List both hard skills (technical skills) and soft skills (interpersonal skills).
Use keywords directly from the job description.
Group skills into categories (e.g., Programming Languages, Project Management, Communication).

Experience:
Reverse chronological order (most recent first).
Company Name, Location, Job Title, Dates of Employment.
Use bullet points to describe your responsibilities and accomplishments.
Focus on quantifiable results (e.g., "Increased sales by 15%").
Use action verbs (e.g., "managed," "developed," "implemented").
Use keywords from the job description within your descriptions.

Education:
Degree Name, Major, University Name, Location, Graduation Date.
Include relevant coursework or GPA. Write a description of what was achieved in the degree. 

Projects: 
Titles of projects completed, year, summary of team and summary of accomplishments.
Use the most relevant information from the user posts provided to you.


This is an example output for a generic software engineering intern role.This format should be adhered strictly to.
Do not include any keys that are not present in the following:

{
  "contactInformation": {
    "fullName": "Jane Doe",
    "phoneNumber": "123-456-7890",
    "email": "jane.doe@example.com",
    "linkedin": "linkedin.com/in/janedoe"
  },

  "summary": "A dedicated student passionate about coding, problem solving and system design"

  "skills": [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "SQL",
    "Git",
    "AWS",
    "Data Structures",
    "Algorithms",
    "Problem Solving"
  ],

  "certifications":["Certified AWS practicioner (2020)", "Google Cloud AI Expert (Jan 2021)"],

  "projects": [
    {
      "title": "Web-Based Task Manager, 2023",
      "description": "Developed a full-stack web application for task management using React for the frontend and Python/Flask for the backend. Implemented user authentication, task creation, and deadline tracking. Utilized a PostgreSQL database for data storage. Deployed the application on AWS Elastic Beanstalk."
    },
    {
      "title": "Data Analysis of Stock Market Trends, 2022",
      "description": "Conducted data analysis of stock market trends using Python libraries like Pandas and NumPy. Visualized data using Matplotlib and Seaborn. Implemented machine learning algorithms for predicting stock prices. Presented findings in a comprehensive report."
    },
    {
      "title": "Mobile Game Development",
      "description": "Developed a mobile game using Java and Android Studio. Implemented game logic, user interface, and sound effects. Utilized Git for version control. Tested the game on various Android devices."
    }
  ],
  "education": 
    {
      "title": "Bachelor of Science in Computer Science",
      "completionYear": "2026",
      "institution": "Taylor's University, Malaysia",
      "gpa": "3.8/4.0",
      "desc": "Developed expertise in software development, data structures, and algorithms through courses such as Software Engineering, Machine Learning, Database Systems, and Cloud Computing. Gained proficiency in Python, Java, and JavaScript, with hands-on experience in web development, AI, and cloud technologies. Built a recommendation system using machine learning techniques, developed a full-stack web application with React.js and Node.js, and optimized database performance in a team project. Applied AI models to analyze datasets, achieving high predictive accuracy. Strong problem-solving and analytical skills with a passion for building scalable and efficient systems."
    },
    
  "experience": [
    {
      "title": "Software Development Intern,Summer 2023",
      "description": "Assisted in developing and testing software features. Collaborated with senior engineers to debug and improve code. Participated in daily stand-up meetings and code reviews."
    },
    {
      "title": "Teaching Assistant - Introduction to Programming, Fall 2022",
      "description": "Assisted students with programming assignments and concepts. Held office hours to provide one-on-one support. Graded assignments and provided feedback."
    },
    {
      "title": "Volunteer Tutor - Coding for Kids, 2021-Present"
      "description": "Taught basic coding concepts to children using Scratch and Python. Assisted in organizing coding workshops and events."
    }
  ]
}
`;

const formattingInstructions = `
The CV should be formatted in a JSON and nothing else.
This output will be parsed by code so there is no need to include formatting such as headers or bolding.
Make sure none of the arrays returned in the response are empty, include examples of things to add. Clearly indicate when soemthing is an example. 
Include the following elements:
1.Contact Information
2.Summary: A short summary that paints the student in a positive light. Try to talk about things mentioned in the job desc. 
           If there isn't sufficient information for this section, you may talk about their education.
2.Skills: (this item should be provided in a list/array format.)
3.certifications: display all the certifications the user has in an array format as specified in the above example. 
3.Projects: An array of JSONS of the most relvant projects (obtained from posts) based on the job description. 
            Ensure that a detailed description is included. Do your best to use information provided in the array of posts.
            Adhere strictly to the example JSON included.
4.Education: The value should be it's own JSON as shown in the example. The educational institution for the current degree is always "Taylor's University, Malaysia"

5.Experience : This should be an array of objects that that includes a title and a description. Use all experience available even if it's not very relevant for the job description provided. 
               However, you should prioritize experience that is most relevant first. 
`;

//required queries: currentUserID(as a param) & jobDesc in the body
const generateCV = async (req, res, next) => {
    try{

      const currentUserID = req.params.id;
      const { about, courseName, currentYear, email, fullName, phoneNumber, profileDetails } = await firestoreService.firebaseRead(`users/${currentUserID}`, next);
      let coursesAndCertifications;
      let skills;
      let workExperience; 

      //stringify profile details
      if (profileDetails.coursesAndCertifications){
          coursesAndCertifications = JSON.stringify(profileDetails.coursesAndCertifications);
      }
      if (profileDetails.skills){
        skills = JSON.stringify(profileDetails.skills);
      }

      if (profileDetails.workExperience) {
        workExperience = JSON.stringify(profileDetails.workExperience);
        console.log(`workExperience: ${workExperience}`);
      }

      // coursesAndCertifications = JSON.stringify(profileDetails(coursesAndCertifications));
      // skills = JSON.stringify(profileDetails(skills));
      // workExperience = JSON.stringify(profileDetails(workExperience));

      // console.log(`\ncurrentUserID@generateCV: ${currentUserID}\n`)
      const posts = JSON.stringify(
        await firestoreService.firebaseReadQuery(
        `posts`,
        [where("authorId","==", currentUserID),], 
        next
      )); 


      const prompt= `${role} ${instructions} ${formattingInstructions}
                    job desc: ${req.body.jobDesc}
                    profile information: about->${about}, courseName --> ${courseName}, current year -> ${currentYear}, email-> ${ email}, fullName->${fullName}, 
                    contact no->${phoneNumber}, Courses and certifications --> ${coursesAndCertifications} , skills --> ${skills}, work Experience->${workExperience}
                    post information: ${posts}
                `;
      const geminiOutput = await geminiService.gemini15Flash.generateContent(prompt);
      
      //remove gemini headers
      const unformatedCV = geminiOutput.response.text();
      const formattedCV = unformatedCV.substring(7, unformatedCV.length -4);
      // console.log(`formattedCV: ${formattedCV}`)
      CVObject = JSON.parse(formattedCV);


      console.log(`CVObject@generateCV: ${JSON.stringify(CVObject)} `)

      await firestoreService.firebaseWrite(
                  `users/${currentUserID}`,
                  { latestCV: CVObject },
                  next
              );

      res.status(200).send(CVObject);
 
  }catch(e){
    console.error(e);
    next(e);
  }
  
}

module.exports = {generateCV};
