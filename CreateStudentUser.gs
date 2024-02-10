/*
BSD 4-Clause License

Copyright (c) [2024], [Kenneth Andrews]
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. All advertising materials mentioning features or use of this software must
   display the following acknowledgement:
     This product includes software developed by [Kenneth Andrews].

4. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY COPYRIGHT HOLDER "AS IS" AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
EVENT SHALL COPYRIGHT HOLDER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


function onSubmit() {
  const subData = extractValues();
  const formattedData = formatResponseData(subData);
  const userData = formatUserData(formattedData);
  addUser(userData);
}


function extractValues() { // Pull data from most recent form submission and extract data.
  const form = FormApp.openById('1VhwXsXV2rRYifTdh2gWPcXggvp3joLcccUSyqLMD4Jg'); // Opens form by ID.
  const formResponses = form.getResponses(); // All responses
  const formCount = formResponses.length;
  const latestSubmission = formResponses[formCount - 1]; // Pull latest form submission.
  const itemResponses = latestSubmission.getItemResponses(); // Pull all responses from latest form submission.

  return itemResponses; // Returns a list of individual responses.
}


// Format Data to make it easier to work with.
function formatResponseData(responseData) {
 const formattedData = {}
 for (let i = 0; i < responseData.length; i++) { // Iterate through responseData and extract key/value pairs.
    const itemResponse = responseData[i];
    const k = itemResponse.getItem().getTitle();
    const v = itemResponse.getResponse().toLowerCase();
    formattedData[k] = v;
 }
 return formattedData; // Returns a hash with key/values. eg keys. 'firstName', 'lastName', 'Teacher Email', 'Graduation Year', 'Grade'.
}


// Format user data for google workspace.
function formatUserData(userData) {
  const firstName = userData['First Name'];
  const lastName = userData['Last Name'];
  const userEmail = generateEmail(firstName, lastName);
  const grade = userData['Grade'];
  const gradYear = userData['Graduation Year'];

  const userInfo = {
    "primaryEmail": userEmail,
    "name": {
      "givenName": firstName,
      "familyName": lastName
    },
    
    // Predefined password - Less Secure.
    "password": "GHA12345",
    
    // Generate Random password - More secure
    //"password": Math.random().toString(36),

    "changePasswordAtNextLogin": passwordPolicy(grade), // passwordPolicy Returns True or False.
  
    "user.OrgUnitPath": `/greaterheightsacademy.org/Distance Learning Devices/${gradYear}`,
  }

  console.log(userInfo);
  return userInfo;
}


// Generates email based on user first name and last name.
function generateEmail(firstName, lastName) {
  let part1 = `${firstName}.${lastName}`
  const part2 =  '@greaterheightsacademy.org'
    for(let i = 2;; i++) { // Loop add/increment number on email until available then return the email.
      let email = part1 + part2; // john.doe@email.com, john.doe2@email.com, ect.
      if(available = emailAvailable(email)) { // If email is available return email, else increment.
        return email;
      }
    part1 = `${firstName}.${lastName}${i}`; // john.doe1, john.doe2, ect
  }
}


// Checks if email is available. Returns true if false if email exists, otherwise returns true.
function emailAvailable(email) {
   try {
    AdminDirectory.Users.get(email); 
      available = false;
  } catch (e) {
      available = true;
 }
 return available;
}


// Force password change at next login if grade is higher than 3.
function passwordPolicy(grade) {
  if(grade in ['Kidnergarten', '1st', '2nd', '3rd']) {
    return false
  }
  return true
}


function addUser(userInfo) {
    try {
    const user = AdminDirectory.Users.insert(userInfo);
    console.log(`User ${user.primaryEmail} created with ID ${user.id}.`);
  } catch (err) {
    // Handle exception from the API.
    console.log('Failed with error %s', err.message);
  }
}


