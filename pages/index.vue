<template>

    <div v-if="!isAuthenticated" class="flex flex-col w-[400px] gap-1">
        <h1>You not logged in</h1>
        <input v-model="username" placeholder="Username" @input="checkIsRegistered()" autocomplete="webauthn username">
        <button class="bg-[#0097ff]" type="is-primary" @click="register()" >Register device</button>
        <button class="bg-[#0097ff]" type="is-primary" @click="login()" >Authenticate</button>
    </div>

    <div v-if="isAuthenticated">
        <p>{{'Hello ' + username + '!'}}</p>
        <div v-if="registrationData && !authenticationData">
            <p><b>Credential ID:</b> {{registrationData.credential.id}}</p>
            <p><b>Public Key:</b> {{registrationData.credential.publicKey.substring(0,32)}}...</p>
            <p><b>Algorithm:</b> {{registrationData.credential.algorithm}}</p>
            <p><b>Authenticator Name:</b> {{registrationData.authenticator.name}}</p>
        </div>
        <div v-if="authenticationData">
            <p><b>Credential ID:</b> {{authenticationData.credentialId}}</p>
            <p><b>Signature:</b> {{authenticationData.signature.substring(0,32)}}...</p>
        </div>
    </div>

    <button type="is-primary" @click="logout()">Sign Out</button>

</template>



<script>
import { client, parsers } from '@passwordless-id/webauthn';
import { doc, updateDoc, addDoc, collection, getDocs, where, query, deleteDoc } from "firebase/firestore";
import { db } from '~/api/firebase.js';

export default {
  data() {
    return {
        username: null,
        isRegistered: false,
        isAuthenticated: false,
        isRoaming: false,
        registrationData: null,
        authenticationData: null
    };
  },

  methods: {

    //addUser function
    async addUserData(credentialId){
      addDoc(collection(db, "users"), { 
        name: "test",
        email: "text@bubbles.dk",
        authID: credentialId
      })
    },

    //readUser info function
    async readUserData(creds){
      try {
          //query user DB for account with matching biometic credentials
          const docRef = await getDocs(
            query(collection(db, "users"), where("authID", "==", creds))
          );

          //get user info - and assign, if any
          let tempArr = []
          docRef.forEach((doc) => {
            tempArr.push(doc.data())
          })

          return tempArr
      
      //log error if issue with DB query
      } catch (error) {
          console.error(error);
        }

    },

    async checkIsRegistered() {
      //console.log(this.username + ' => ' + !!window.localStorage.getItem(this.username))
      this.isRegistered = !!window.localStorage.getItem(this.username)
    },

    async register() {
      let res = await client.register(this.username, window.crypto.randomUUID(), { authType: 'auto' })
      console.debug(res)

      const parsed = parsers.parseRegistration(res)
      console.log(parsed)

      window.localStorage.setItem(this.username, parsed.credential.id)
      this.isAuthenticated = true
      this.registrationData = parsed

      await this.addUserData(parsed.credential.id)

      await this.checkIsRegistered()
    },

    async login() {
      let credentialId = window.localStorage.getItem(this.username)
      let res = await client.authenticate(credentialId ? [credentialId] : [], window.crypto.randomUUID(), { authType: 'auto' })
      console.debug(res)

      const parsed = parsers.parseAuthentication(res)
      console.log(parsed.credentialId)

      let response = await this.readUserData(parsed.credentialId)
       //if user with credentials found.
       if (response.length != 0) {
            console.log(response[0])
            this.isAuthenticated = true
            this.authenticationData = parsed
          } 

      //if user cant be found
      else {
        console.log("Invalid user credentials")
      }

    },

    async logout() {
      this.isAuthenticated = false;
      this.authenticationData = null
      this.registrationData = null
    }
  }
};

</script>