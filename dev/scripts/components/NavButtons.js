import React from 'react';

export default class NavButtons extends React.Component {
	render(){
		const changeViewButton = () => {
			if (this.props.currentPage === 'home') {
				return (
					
						
						<button onClick={()=>this.props.changeView()}> Change View</button>
					)
			} else {
				return (<button className="changePage" onClick={() => this.props.changePage('home')}>Explore Hub</button>)
			}
		}
		if (this.props.loggedIn) {
			return (
				<header>
					{changeViewButton()}
					
					<button className="changePage" onClick={() => this.props.changePage('ownProfile')}>My Profile</button>
					<button onClick={this.props.logout} id="logout">Log Out</button>
				</header>
			)
		} else {
			return ( 
				<header className="public">
					<p>Log in with your Google Account to upload your own posts to the hub!</p>
					<div className="publicButtons">
						{changeViewButton()}
						<button onClick={this.props.login} id="googleButton"><i className="fa fa-google-plus"  aria-hidden="true"></i>Log In</button>

					</div>
				</header>
			)
		}
	}
}