import React from 'react';
import ReactDOM from 'react-dom';
import ProfileHeader from '/components/ProfileHeader';
import ProfileGallery from '/components/ProfileGallery';
import { default as swal } from 'sweetalert2';

  // Initialize Firebase
var config = {
	apiKey: "AIzaSyBBnDL6U0mxG308lsVoWpTWe-ikiO7hTGE",
	authDomain: "mappetite-88939.firebaseapp.com",
	databaseURL: "https://mappetite-88939.firebaseio.com",
	projectId: "mappetite-88939",
	storageBucket: "mappetite-88939.appspot.com",
	messagingSenderId: "108267767400"
};

firebase.initializeApp(config);
// initializing authenication variables 
const auth = firebase.auth(); //authentication 
const provider = new firebase.auth.GoogleAuthProvider();
const dbRef = firebase.database().ref('/'); //Root reference for firebase database
const storageRef = firebase.storage().ref(); // Root reference for firebase image storage

class App extends React.Component {
	constructor() {
		super(); 
		this.state = {
			user: null,
			loggedIn: false,

			allPosts: [],
			postView: true,
			yourInfo: {},
			yourPosts: [],
			newPost: false, 

			currentPage: 'ownProfile',
			userPageID: null,
			userInfo: {},
			userPosts: [],
		}
		// binding these functions to App to use 'this'
		this.showNewPostPrompt = this.showNewPostPrompt.bind(this);
		this.hideNewPostPrompt = this.hideNewPostPrompt.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handlePostSubmit = this.handlePostSubmit.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.uploadPhoto = this.uploadPhoto.bind(this);
		this.changePage = this.changePage.bind(this);
		this.grabUsersInfo = this.grabUsersInfo.bind(this);
		this.removePost = this.removePost.bind(this);
		this.changeView = this.changeView.bind(this);
	}

	showNewPostPrompt(e) {
		e.preventDefault();
		console.log ('worked')
		this.setState ({
			newPost: true
		});
	}
	hideNewPostPrompt(){
		this.setState({
			newPost: false
		})
	}
	handlePostSubmit(e) {
		console.log('hit')
		e.preventDefault();
		const userId = this.state.user.uid; //unique user id = user root folder
		const userRef = firebase.database().ref(`${userId}/posts/`);
		let photo = this.state.photo || undefined;
		let time = Date();
		const post = {
			userId: userId,
			name: this.state.user.providerData['0'].displayName,
			profilePic: this.state.user.photoURL,
			location: this.state.location,
			photo: this.state.photo,
			note: this.state.note,
			time: time,
		}
		userRef.push(post); // push post into user DB 
		// dbRef.push(post); //general data push for homepage?

		this.setState ({
			newPost: false
		});
	}
	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	removePost(key, photoURL) {
		const userId = this.state.user.uid; ////unique user id = user root folder
		const userRef = firebase.database().ref(`${userId}/posts/${key}`); //ref corresponding post db 
		const userPhoto = firebase.storage().refFromURL(photoURL); //ref photo via URL in storage

		if (swal({
			  title: 'Are you sure?',
			  text: "You won't be able to revert this!",
			  type: 'warning',
			  showCancelButton: true,
			  confirmButtonColor: '#3085d6',
			  cancelButtonColor: '#d33',
			  confirmButtonText: 'Yes, delete it!'
			}).then(function () {
			  swal(
			    'Deleted!',
			    'Your file has been deleted.',
			    'success'
			  )
			  userRef.remove(); //remove post from db
			  userPhoto.delete(); //delete corresponding photo to post
			  console.log('delete successful!')
			})) {

			
		}
		console.log(this.state.user)
		

	}

	uploadPhoto(e) {
		let file = e.target.files[0]; //file uploaded 
		const userId = this.state.user.uid; //unique user id = user root folder
		const storageRef = firebase.storage().ref(`${userId}/${file.name}`) //firebase.storage.ref("folderName/file.jpg");
		const task = storageRef.put(file).then(() => {
			const urlObject = storageRef.getDownloadURL().then((data) => { 
					this.setState ({photo: data})//stores URL into our firebase DB post for reference
				})
		});

		//preview image uploaded
		let output = document.getElementById('output');
    	output.src = URL.createObjectURL(e.target.files[0]);
    	output.classList.add('show');
	}
	changePage(page){
		this.setState({
			currentPage: page,
			activePost: {},
			postView: true,
		});
	}
	nothing () {
		console.log('nothing Happens')
	}
	login() {
		auth.signInWithPopup(provider) //firebase method (Google) for authentication
			.then((result) => {
				const user = result.user;
				this.setState({
					user: user, //store user data into state
					loggedIn: true,
					currentPage: 'ownProfile',
				})
			})
	}
	logout() {
		auth.signOut()
			.then(() => {
				this.setState({
					user: null,
					loggedIn: false,
				});
			});
	}
 	changeView () {
 		this.setState ({
 			postView: !this.state.postView,
 		})
 	}

	grabUsersInfo(userId)  {
		if (this.state.yourInfo.userId === userId) { // show our profile if our name clicked
			this.setState ({
				currentPage: 'ownProfile',
				postView: true,
			}) 
		} else { // show user clicked profile
			const userInfoRef = firebase.database().ref(userId+'/info/');
			userInfoRef.on('value', (snapshot) =>{
				this.setState ({
					userInfo: snapshot.val(),
				})
			});
			const userPostRef = firebase.database().ref(userId+'/posts/');
			userPostRef.on('value', (snapshot) => {
				const userDBPosts = snapshot.val();
				const userPost = [];
				console.log (userDBPosts);
				for (let key in userDBPosts) {
					userPost.push({
						userId: userDBPosts[key].userId,
						name: userDBPosts[key].name,
						profilePic: userDBPosts[key].profilePic,
						location: userDBPosts[key].location,
						photo: userDBPosts[key].photo,
						note: userDBPosts[key].note,
						time: userDBPosts[key].time
					})
				}
				
				const sortedPosts = userPost.sort(function(a,b) { 
				    return new Date(b.time) - new Date(a.time);
				});

				this.setState({
					userPosts: sortedPosts
				})
			})
			this.setState ({
				currentPage: 'userProfile',
				postView: true,
			})
		}
	}

	componentDidMount() {
		dbRef.on('value', (snapshot) => {  //GRABBING ALL POSTS FOR HOME PAGE (logged in or not)
			const allDB = snapshot.val();
			const allPost = [];
			for (let user in allDB){
				let allUserRef = firebase.database().ref(user+'/posts/');
				
				allUserRef.on('value', (snapshot) => {
				let allUserPosts = snapshot.val();
				// console.log(allUserPosts)
					for (let key in allUserPosts) {
						allPost.push({
							userId: allUserPosts[key].userId,
							name: allUserPosts[key].name,
							profilePic: allUserPosts[key].profilePic,
							location: allUserPosts[key].location,
							photo: allUserPosts[key].photo,
							note: allUserPosts[key].note,
							time: allUserPosts[key].time
						});
					}
				})
			}
			const sortedAllPosts = allPost.sort(function(a,b) { 
			    return new Date(b.time) - new Date(a.time);
			});

			this.setState({
				allPosts: sortedAllPosts
			})
		});

		auth.onAuthStateChanged((user) => {// Check if user is already logged in
			if (user) {
				console.log('User is logged in!');
				this.setState({
					user: user,
					loggedIn: true,
				});
				const userName = user.providerData['0'].displayName;
				const userId = user.uid; //unique user id = user root folder
				const userInfoRef = firebase.database().ref(userId+'/info/');
				userInfoRef.set({ //store information 
					name: user.providerData['0'].displayName,
					userId: userId,
					pic: user.photoURL,
				});
				userInfoRef.on('value', (snapshot) =>{
					this.setState ({
						yourInfo: snapshot.val(),
					})
				})

				const userPostRef = firebase.database().ref(userId+'/posts/'); //ref user folder DB
				userPostRef.on('value', (snapshot) => { // GRABBING THE USERS POSTS ONLY
					const dbPosts = snapshot.val(); //snapshot of items in DB
					const existingPosts = []; //pushing exisitng posts from DB

					for (let key in dbPosts) {
						existingPosts.push({
							key: key,
							profilePic: dbPosts[key].profilePic,
							name: dbPosts[key].name,
							location: dbPosts[key].location,
							photo: dbPosts[key].photo,
							note: dbPosts[key].note,
							time: dbPosts[key].time
						});
					}
					const sortedPosts = existingPosts.sort(function(a,b) { 
				    return new Date(b.time) - new Date(a.time);
					});
					this.setState({
						yourPosts: sortedPosts

					});
				});
			} else {
				console.log('User is not logged in.');
				this.setState({
					user:null,
					loggedIn: false,
					currentPage: 'home'
				})
			}
		});
	}

	render() {
		const newPost = () => {
			if (this.state.newPost === true) {
				return (
					<div className="modal" >
						<div className="overlay" onClick={this.hideNewPostPrompt}></div>
						<form className="newPost">
							<h2>New Post</h2>
							<input name="location" type="text" placeholder="Location"  onChange={this.handleChange}/>
							<input type="file" name="photo" accept="image/*" onChange={this.uploadPhoto} />
							<img id="output"/>
							<textarea placeholder="Photo Caption" onChange={this.handleChange} maxLength="200" type="text" name="note"></textarea>
							<button className="addPost" onClick={this.handlePostSubmit}> Add Post</button>
							<button className="closeModal" onClick={this.hideNewPostPrompt}> X </button>
						</form>
						
					</div>
				)
			}
		}


			
		const showPage = () => {
				if (this.state.currentPage === 'ownProfile') { // Your Profile
					return (
						<div className="profile yourProfile wrapper">
							<ProfileHeader profileInfo = {this.state.yourInfo} currentPage={this.state.currentPage} showNewPost={this.showNewPostPrompt}/>
							<ProfileGallery postList = {this.state.yourPosts} profileState={this.state.currentPage} grabUsersInfo={this.nothing} removePost={this.removePost} />
						</div>)
				} else if (this.state.currentPage === 'home') { //Explore the Hub
					return (
						<div>
							<div className="homeGallery wrapper">
								<h2>The Hub</h2>
								<ProfileGallery postList = {this.state.allPosts} profileState={this.state.currentPage} grabUsersInfo={this.grabUsersInfo} postView={this.state.postView}/>
							</div>
						</div>
					)
				} else if (this.state.currentPage === 'userProfile') { // User's Profile
						return (
							<div className="profile wrapper">
								<ProfileHeader profileInfo = {this.state.userInfo} currentPage={this.state.currentPage}/>
								<ProfileGallery postList = {this.state.userPosts} profileState={this.state.currentPage} grabUsersInfo={this.nothing} postView={this.state.postView}/>
							</div>
						)
				}
		}

		return (
			<main>
				<h1>HackerHub</h1>
				<NavButtons loggedIn = {this.state.loggedIn} login={this.login} logout={this.logout} changePage={this.changePage} currentPage={this.state.currentPage} changeView={this.changeView}/>
				{newPost()}
				{showPage()}
			</main>
		)
	}
	
}

ReactDOM.render(<App />, document.getElementById('app'));
