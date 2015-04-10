'use strict'

var React = require('react');

var RegisterForm = React.createClass({

	getInitialState: function() {
    	return {errors: ''};
  	},
  	handleSubmit: function(e) {
	    e.preventDefault();
	    var name = this.refs.name.getDOMNode().value.trim();
	    var email = this.refs.email.getDOMNode().value.trim();
	    var password = this.refs.password.getDOMNode().value.trim();
	    var confirm_password = this.refs.confirm_password.getDOMNode().value.trim();

	    if (!name || !email || !password || !confirm_password) {
	      	return;
	    }
	    if (password != confirm_password) {
	    	this.setState({
        		errors: <div>Password do not match!</div>
        	});
	    	return;
	    }
	    this.props.onCommentSubmit({
	    	"name": name, 
	    	"email": email, 
	    	"password": password,
	    	"confirmPassword": confirm_password
	    });
	    this.setState({
        	errors: ''
        });
	    return;
  	},
  	render: function() {
	    return (
	    <div>
	    	{ this.state.errors }
	      	<form className="main-form" onSubmit={this.handleSubmit}>

	            <div>
	                <input required id="name" type="text" name="name" placeholder="Full Name" ref="name" />
	            </div>

	            <div>
	                <input required id="email_block" type="email" name="email" placeholder="Email Address" ref="email" />
	            </div>

	            <div>
	                <input required id="password_block" name="password" type="password" placeholder="password" ref="password" />
	            </div>
	            <div>
	                <input required id="confirm_password" name="confirm_password" type="password" placeholder="confirm password" ref="confirm_password"/>
	            </div>

	            <div>
	                <button type="submit">Sign up</button>
	            </div>
	        </form>
	    </div>
	    );
  	}
});

var Register = React.createClass({
	getInitialState: function() {
    	return {errors: ''};
  	},
	handleCommentSubmit: function(user) {
		console.log(user);
    	$.ajax({
      		url: "/register",
      		dataType: 'text',
      		contentType: 'application/json',
      		type: 'POST',
      		data: JSON.stringify(user),
      		success: this.props.onsuccess,
      		error: function(xhr, status, err) {
        		console.log(xhr.responseText, status, err);
        		var error_description = xhr.responseText;
        		
        		this.setState({
        			errors: <div>{xhr.responseText}</div>
        		});
      		}.bind(this)
    	});
  	},
  	render: function() {
  		return (
		    <div>
		        <h2>Sign Up</h2>
		        { this.state.errors }
			    <RegisterForm onCommentSubmit={this.handleCommentSubmit} />		        
		    </div>
	   	);
  	}
});

module.exports = Register;
React.render(<Register onsuccess={function(data){window.location='/';}}/>, document.querySelector('#container'));