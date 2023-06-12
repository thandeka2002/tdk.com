import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController,AlertController, NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  name: any;
  surname: any;
  email: any;
  password: any;
  confirmPassword: any;

  constructor( private db: AngularFirestore,private router:Router,private toastController: ToastController,
     private alertController: AlertController,private loadingController: LoadingController,
      public navCtrl: NavController, private auth: AngularFireAuth) {}


  ngOnInit() {
  }

  async register() {
    if (!this.name || !this.surname || !this.email || !this.password || !this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'All fields are required', 
        duration: 2000,
        position: 'top', // Position of the toast
        color: 'danger' // color of the toast
      });
      toast.present();
      return;
    }

    if (this.password.length < 8) {
      const toast = await this.toastController.create({
        message: 'Password must be at least 8 characters long',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }

    if (this.password !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Passwords do not match',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Additional password validation (at least one number, one uppercase, and one special character)
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      const toast = await this.toastController.create({
        message: 'Password must contain at least one number, one uppercase letter, and one special character',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      toast.present();
      return;
    }

    const loader = await this.loadingController.create({
      message: 'Signing up',
      cssClass: 'custom-loader-class'
    });
    await loader.present();

    this.auth.createUserWithEmailAndPassword(this.email, this.password)
      .then( userCredential => {

        this.sendVerificationEmail(userCredential.user);

        //////
        this.db
        .collection('users')
        .add({
           name:this.name,
           surname:this.surname,
           email: this.email
        })
        .then((docRef) => {
          loader.dismiss();

        })
        .catch((error) => {
          loader.dismiss();
          console.error('Error adding document: ', error);
          alert('faild : ' + error);
        });
    

        /////
        this.router.navigateByUrl("/login");
       
        // ...
      })
      .catch(async( error:any) => {
        loader.dismiss();
        const errorCode = error.code;
        const errorMessage = error.message;
       


        if(errorMessage=='Firebase: The email address is badly formatted. (auth/invalid-email).'){
        const toast = await this.toastController.create({
          message: "The email address is badly formatted",
          duration: 2000,
          position: 'top'
        });
        toast.present();
        return;
      }else if(errorMessage=="Firebase: The email address is already in use by another account. (auth/email-already-in-use)."){
        const toast = await this.toastController.create({
          message: "The email address is already in use by another account",
          duration: 2000,
          position: 'top'
        });
        toast.present();
        return;
    }
      });
    
  }
    // Registration logic
    // You can handle the registration process here

    async sendVerificationEmail(user:any) {
      try {
        await user.sendEmailVerification();
        this.presentToast('Verification email sent. Please check your inbox.');
      } catch (error) {
        console.error('Error sending verification email:', error);
        this.presentToast('Error sending verification email. Please try again.');
      }
    }

    async presentToast(message: string) {
      const toast = await this.toastController.create({
        message: message,
        duration: 2000,
        position: 'top',
        color: 'primary',
      });
      toast.present();
    }

  }

  
  
  




