import React from 'react';

export default class ProfileHeader extends React.Component {
	render() {
		const addPostButton = () => {
			if (this.props.currentPage === 'ownProfile') {
				return (<button className="addPost" onClick={this.props.showNewPost}><i className="fa fa-plus" aria-hidden="true"></i><span id="newPost">New Post</span></button>)
			}
		}
		return (
			<div className="profileHeader clearfix">
				<img src={this.props.profileInfo.pic} className="profilePic"/>
				<h1>{this.props.profileInfo.name}</h1>
				{addPostButton()}
			</div>)
	}
}