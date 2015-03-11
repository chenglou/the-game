'use strict'

var React = require('react');

var LoginForm = React.createClass({

	getInitialState: function() {
    	return {errors: ''};
  	},
  	handleSubmit: function(e) {
	    e.preventDefault();
	    var email = this.refs.email.getDOMNode().value.trim();
	    var password = this.refs.password.getDOMNode().value.trim();
	    
	    if (!email || !password) {
	      	return;
	    }
	    this.props.onCommentSubmit({
	    	"email": email,
	    	"password": password
	    	//"redirect": '/'
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
	      	<form id="register_form" className="main-form" onSubmit={this.handleSubmit}>

				<div>
	                <input required id="email_block" type="email" name="email" placeholder="Email Address" ref="email" />
	            </div>

	            <div>
	                <input required id="password_block" name="password" type="password" placeholder="password" ref="password" />
	            </div>
	            <div>
	                <button type="submit">Log in</button>
	            </div>
	        </form>
	    </div>
	    );
  	}
});

var Login = React.createClass({

	handleCommentSubmit: function(user) {
		console.log(user);
    	$.ajax({
      		url: "/login",
      		dataType: 'text',
      		contentType: 'application/json',
      		type: 'POST',
      		data: JSON.stringify(user),
      		success: this.props.onsuccess.bind(this),
      		error: function(xhr, status, err) {
        		console.log(xhr.responseText, status, err);
        		var error_description = xhr.responseText;
        		
        		this.setState({
        			errors: <div>{xhr.responseText}</div>
        		});
      		}.bind(this)
    	});
  	},
  	getInitialState: function() {
    	return {errors: ''};
  	},
  	render: function() {
  		return (
		    <div>
		        <h2>Log in</h2>
		        { this.state.errors }
			    <LoginForm onCommentSubmit={this.handleCommentSubmit} />		        
		    </div>
	   	);
  	}
});

module.exports = Login;
React.render(<Login onsuccess={function(data){window.location='/';}}/>, document.querySelector('#container'));