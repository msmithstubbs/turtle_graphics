/*
 * Logo graphics interpreter
 * matt@smith-stubbs.com
 */

var Tokenize = function(src) {
  var self = this,
      tokens = src.trim().split("\n");

  var matched = [];

  tokens.forEach(function(token) {
    var parsedToken = self.parse(token);
    if (parsedToken !== false) {
      matched.push(parsedToken);
    } else {
      console.error('Syntax error: ' + token);
    }
  });

  return matched;
}

Tokenize.prototype = {
  GRAMMAR: [    // valid expressions
    /(penup|pendown)/,
    /((forward|backward|right|left)(\s)+(\d)+)/,
    /color\s#[a-fA-F0-9]{6}/
  ],

  parse: function(token) {
    token = token.trim();

    var i = this.GRAMMAR.length;

    while(i--) {
      if (token.search(this.GRAMMAR[i]) === 0) {
        return token;
      }
    }

    return false; // statement not recgonized
  }
};


var Render = function(canvas, commands) {
  var self = this;

  this.width = canvas.width;
  this.height = canvas.height;

  this.ctx = canvas.getContext('2d');
  this.prepare();

  commands.forEach(function(cmd) {
    var comps = cmd.split(' ');
    self[comps[0]].apply(self, comps.slice(1));
  });

  this.ctx.stroke();
};

Render.prototype = {
  draw: true,  // pen down by default
  heading: 270, // start pointing north
  x: null,  //  turtle position
  y: null,
  width: null,
  height: null,

  forward: function(n) {
    this.drawLine(n, 0);
  },

  backward: function(n) {
    this.drawLine(-n, 0);
  },

  right: function(n) {
    this.drawLine(0, n);
  },

  left: function(n) {
    this.drawLine(0, (0 - n));
  },

  penup: function() {
    this.draw = false;
  },

  pendown: function() {
    this.draw = true;
  },

  color: function(val) {
    this.ctx.stroke();
    this.ctx.strokeStyle = val;
    this.ctx.beginPath();
    // this.ctx.moveTo(this.x, this.y);
  },

 drawLine: function(dist, degrees) {
   this.heading = this.heading + parseInt(degrees, 10);
   this.x = this.x + Math.cos(this.toRad(this.heading)) * dist;
   this.y = this.y + Math.sin(this.toRad(this.heading)) * dist;

   this.draw ? this.ctx.lineTo(this.x, this.y) 
             : this.ctx.moveTo(this.x, this.y);
 },

 prepare: function() {
  this.ctx.clearRect(0, 0, this.width, this.height);

  // set initial pen position
  this.x = this.width / 2;
  this.y = this.height / 2;

  this.ctx.strokeStyle = '#ff0000';
  this.ctx.beginPath();
  this.ctx.moveTo(this.x, this.y);
 },

 toRad: function(degrees) {
  return degrees * (3.14 / 180);
 }

}

function init() {
  var canvas = document.querySelector('canvas'),
      textarea = document.querySelectorAll('textarea')[0];

  var run = function() {
    var commands = new Tokenize(textarea.value);
    render = new Render(canvas, commands);
  };

  document.querySelector('button').onclick = run;
  run();
}

window.onload = init;
