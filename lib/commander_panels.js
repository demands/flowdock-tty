var _ = require('underscore');
var keypress = require('keypress');
var panels = require('./panels');
var logger = require('./debug_logger');

var CommanderPanel = function(options) {
  options = _.defaults(options, {
    focused: true,
    inputStream: process.stdin,
    prompt: "> "
  });
  panels.Panel.call(this, options);
  keypress(this.inputStream);
  this.buffer = '';
  this.resetCursor();
  this.inputStream.on('keypress', _.bind(CommanderPanel.prototype.onKeypress, this));
};
_.extend(CommanderPanel.prototype, panels.Panel.prototype);

CommanderPanel.prototype.getPanelType = function() {
  return 'commander';
};

CommanderPanel.prototype.onKeypress = function(chunk, key) {
  if(!this.focused) return;
  if(key) {
    if(key.name === "enter") {
      return this.commandComplete();
    }
    if(key.name === "backspace") {
      if(this.buffer.length > 0) {
        this.buffer = this.buffer.slice(0, -1);
        this.cursorX -= 1;
        this.replaceCursor();
        this.write(' ');
        this.replaceCursor();
      }
      return;
    }
  }
  if(chunk) {
    this.buffer += chunk;
    this.replaceCursor();
    this.write(chunk);
    this.cursorX += chunk.length;
  }
};

CommanderPanel.prototype.replaceCursor = function() {
  this.placeCursor(this.cursorX, this.cursorY);
};

CommanderPanel.prototype.resetCursor = function() {
  this.cursorX = this.prompt.length + this.buffer.length;
  this.cursorY = 0;
};

CommanderPanel.prototype.render = function() {
  this.clear();
  this.placeCursor(0,0);
  this.write(this.prompt + this.buffer);
};

CommanderPanel.prototype.commandComplete = function() {
  this.emit('command', this.buffer);
  this.buffer = '';
  this.render();
  this.resetCursor();
};

exports.CommanderPanel = CommanderPanel;
