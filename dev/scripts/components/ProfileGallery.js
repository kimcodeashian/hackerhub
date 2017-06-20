import React from 'react';

export default class ProfileGallery extends React.Component {
	constructor() {
		super(); 
		this.state ={ 
			postShow: false,
			activePost: {}
		}
		this.grabActivePost = this.grabActivePost.bind(this);
		this.closeActivePost = this.closeActivePost.bind(this);
	}
	grabActivePost(post) {
		this.setState ({
			postShow: true,
			activePost: post,
		})

	}
	closeActivePost() {
		this.setState({
			activePost: {},
			postShow: !this.state.postShow,
		})
	}
	render(){
		const expandPost = (post) => {
			if (this.state.postShow) {
				return (
					<div className="modal">
						<div className="overlay" onClick={this.closeActivePost} ></div>
						<div className="bigPost"> 
							<img className="profilePic" src={post.profilePic} alt=""/>
							<h3 className="name" onClick={()=>this.props.grabUsersInfo(post.userId)}> {post.name}</h3>
							<p className="postLocation"><i className="fa fa-map-marker" aria-hidden="true"></i>{post.location}</p>
							<img className="postPic" src={post.photo}  alt=""/>
							<p className="postNote"><i className="fa fa-commenting-o" aria-hidden="true"></i>{post.note}</p>
							<button className="closeModal" onClick={this.closeActivePost} ><i className="fa fa-times" aria-hidden="true"></i></button>
						</div>
					</div>
				)
			} 
		}

		if (this.props.postList.length == 0) {
			return (
				<h2 className="noPosts">Nothing to see here! <i className="fa fa-frown-o" aria-hidden="true"></i></h2>
			)
		} 
		else { 
			if (this.props.profileState === 'ownProfile') {
				return (
					<ul className="profileGallery">
						{expandPost(this.state.activePost)}
						{this.props.postList.map((post) => {
							return (
								<li className="post" key={post.key} > 
									<img src={`${post.photo}`}  onClick={()=>this.grabActivePost(post)} alt=""/>
									<button className="removeButton" onClick={() => this.props.removePost(post.key, post.photo)}><i className="fa fa-trash" aria-hidden="true"></i></button>
								</li>)
						})}
					</ul>)
			}
			else{
				if (this.props.postView) {
					return (
					<ul className="profileGallery">
						{expandPost(this.state.activePost)}
						{this.props.postList.map((post) => {
							return (
								<li className="post" key={post.key} > 
									<img src={`${post.photo}`}  onClick={()=>this.grabActivePost(post)} alt=""/>
								</li>)
						})}
					</ul>)
				} else {
					return (
						<ul className="homeGallery">
							{/*mapping over each object in the array list of posts,*/}
							{this.props.postList.map((post) => {
								return (
								<li className="bigPost"> 
									<img className="profilePic"src={post.profilePic} alt=""/>
									<h3 className="name" onClick={()=>this.props.grabUsersInfo(post.userId)}> {post.name}</h3>
									<p className="postLocation"><i className="fa fa-map-marker" aria-hidden="true"></i>{post.location}</p>
									<img className="postPic" src={`${post.photo}`}  alt=""/>
									<p className="postNote"><i className="fa fa-commenting-o" aria-hidden="true"></i>{post.note}</p>
								</li>
								)	
							})}
						</ul>)
				}
			}

			
		}
	}
}