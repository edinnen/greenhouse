// source: irrigation.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.EmptyMessage', null, global);
goog.exportSymbol('proto.IrrigationRequest', null, global);
goog.exportSymbol('proto.Irrigator', null, global);
goog.exportSymbol('proto.Solenoid', null, global);
goog.exportSymbol('proto.Solenoid.State', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Solenoid = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.Solenoid, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.Solenoid.displayName = 'proto.Solenoid';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Irrigator = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.Irrigator.repeatedFields_, null);
};
goog.inherits(proto.Irrigator, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.Irrigator.displayName = 'proto.Irrigator';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.IrrigationRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.IrrigationRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.IrrigationRequest.displayName = 'proto.IrrigationRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.EmptyMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.EmptyMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.EmptyMessage.displayName = 'proto.EmptyMessage';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Solenoid.prototype.toObject = function(opt_includeInstance) {
  return proto.Solenoid.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Solenoid} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Solenoid.toObject = function(includeInstance, msg) {
  var f, obj = {
    state: jspb.Message.getFieldWithDefault(msg, 1, 0),
    pin: jspb.Message.getFieldWithDefault(msg, 2, 0),
    override: jspb.Message.getBooleanFieldWithDefault(msg, 3, false),
    litrestodispense: jspb.Message.getFieldWithDefault(msg, 4, 0),
    lengthofsoakerhose: jspb.Message.getFloatingPointFieldWithDefault(msg, 5, 0.0),
    litresdispensed: jspb.Message.getFloatingPointFieldWithDefault(msg, 6, 0.0),
    lastoverridden: jspb.Message.getFieldWithDefault(msg, 7, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Solenoid}
 */
proto.Solenoid.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Solenoid;
  return proto.Solenoid.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Solenoid} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Solenoid}
 */
proto.Solenoid.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.Solenoid.State} */ (reader.readEnum());
      msg.setState(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPin(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setOverride(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLitrestodispense(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLengthofsoakerhose(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLitresdispensed(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setLastoverridden(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Solenoid.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Solenoid.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Solenoid} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Solenoid.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPin();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getOverride();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getLitrestodispense();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getLengthofsoakerhose();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getLitresdispensed();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getLastoverridden();
  if (f !== 0) {
    writer.writeInt32(
      7,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.Solenoid.State = {
  OFF: 0,
  ON: 1
};

/**
 * optional State state = 1;
 * @return {!proto.Solenoid.State}
 */
proto.Solenoid.prototype.getState = function() {
  return /** @type {!proto.Solenoid.State} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.Solenoid.State} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional int32 pin = 2;
 * @return {number}
 */
proto.Solenoid.prototype.getPin = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setPin = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional bool override = 3;
 * @return {boolean}
 */
proto.Solenoid.prototype.getOverride = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 3, false));
};


/**
 * @param {boolean} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setOverride = function(value) {
  return jspb.Message.setProto3BooleanField(this, 3, value);
};


/**
 * optional int32 litresToDispense = 4;
 * @return {number}
 */
proto.Solenoid.prototype.getLitrestodispense = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setLitrestodispense = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional float lengthOfSoakerHose = 5;
 * @return {number}
 */
proto.Solenoid.prototype.getLengthofsoakerhose = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 5, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setLengthofsoakerhose = function(value) {
  return jspb.Message.setProto3FloatField(this, 5, value);
};


/**
 * optional float litresDispensed = 6;
 * @return {number}
 */
proto.Solenoid.prototype.getLitresdispensed = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 6, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setLitresdispensed = function(value) {
  return jspb.Message.setProto3FloatField(this, 6, value);
};


/**
 * optional int32 lastOverridden = 7;
 * @return {number}
 */
proto.Solenoid.prototype.getLastoverridden = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/**
 * @param {number} value
 * @return {!proto.Solenoid} returns this
 */
proto.Solenoid.prototype.setLastoverridden = function(value) {
  return jspb.Message.setProto3IntField(this, 7, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.Irrigator.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Irrigator.prototype.toObject = function(opt_includeInstance) {
  return proto.Irrigator.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Irrigator} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Irrigator.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, 0),
    solenoidsList: jspb.Message.toObjectList(msg.getSolenoidsList(),
    proto.Solenoid.toObject, includeInstance),
    lastwatered: jspb.Message.getFieldWithDefault(msg, 3, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 4, 0),
    rainlockout: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    lastlockout: jspb.Message.getFieldWithDefault(msg, 6, 0),
    irrigating: jspb.Message.getBooleanFieldWithDefault(msg, 7, false),
    temperature: jspb.Message.getFloatingPointFieldWithDefault(msg, 8, 0.0),
    timing: jspb.Message.getFieldWithDefault(msg, 9, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Irrigator}
 */
proto.Irrigator.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Irrigator;
  return proto.Irrigator.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Irrigator} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Irrigator}
 */
proto.Irrigator.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setId(value);
      break;
    case 2:
      var value = new proto.Solenoid;
      reader.readMessage(value,proto.Solenoid.deserializeBinaryFromReader);
      msg.addSolenoids(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setLastwatered(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setRainlockout(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setLastlockout(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIrrigating(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTemperature(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTiming(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Irrigator.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Irrigator.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Irrigator} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Irrigator.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
  f = message.getSolenoidsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.Solenoid.serializeBinaryToWriter
    );
  }
  f = message.getLastwatered();
  if (f !== 0) {
    writer.writeInt64(
      3,
      f
    );
  }
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      4,
      f
    );
  }
  f = message.getRainlockout();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getLastlockout();
  if (f !== 0) {
    writer.writeInt64(
      6,
      f
    );
  }
  f = message.getIrrigating();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getTemperature();
  if (f !== 0.0) {
    writer.writeFloat(
      8,
      f
    );
  }
  f = message.getTiming();
  if (f !== 0) {
    writer.writeInt64(
      9,
      f
    );
  }
};


/**
 * optional int32 id = 1;
 * @return {number}
 */
proto.Irrigator.prototype.getId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setId = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * repeated Solenoid solenoids = 2;
 * @return {!Array<!proto.Solenoid>}
 */
proto.Irrigator.prototype.getSolenoidsList = function() {
  return /** @type{!Array<!proto.Solenoid>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.Solenoid, 2));
};


/**
 * @param {!Array<!proto.Solenoid>} value
 * @return {!proto.Irrigator} returns this
*/
proto.Irrigator.prototype.setSolenoidsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.Solenoid=} opt_value
 * @param {number=} opt_index
 * @return {!proto.Solenoid}
 */
proto.Irrigator.prototype.addSolenoids = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.Solenoid, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.clearSolenoidsList = function() {
  return this.setSolenoidsList([]);
};


/**
 * optional int64 lastWatered = 3;
 * @return {number}
 */
proto.Irrigator.prototype.getLastwatered = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setLastwatered = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int64 timestamp = 4;
 * @return {number}
 */
proto.Irrigator.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional bool rainLockout = 5;
 * @return {boolean}
 */
proto.Irrigator.prototype.getRainlockout = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setRainlockout = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional int64 lastLockout = 6;
 * @return {number}
 */
proto.Irrigator.prototype.getLastlockout = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setLastlockout = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * optional bool irrigating = 7;
 * @return {boolean}
 */
proto.Irrigator.prototype.getIrrigating = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 7, false));
};


/**
 * @param {boolean} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setIrrigating = function(value) {
  return jspb.Message.setProto3BooleanField(this, 7, value);
};


/**
 * optional float temperature = 8;
 * @return {number}
 */
proto.Irrigator.prototype.getTemperature = function() {
  return /** @type {number} */ (jspb.Message.getFloatingPointFieldWithDefault(this, 8, 0.0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setTemperature = function(value) {
  return jspb.Message.setProto3FloatField(this, 8, value);
};


/**
 * optional int64 timing = 9;
 * @return {number}
 */
proto.Irrigator.prototype.getTiming = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/**
 * @param {number} value
 * @return {!proto.Irrigator} returns this
 */
proto.Irrigator.prototype.setTiming = function(value) {
  return jspb.Message.setProto3IntField(this, 9, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.IrrigationRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.IrrigationRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.IrrigationRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.IrrigationRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.IrrigationRequest}
 */
proto.IrrigationRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.IrrigationRequest;
  return proto.IrrigationRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.IrrigationRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.IrrigationRequest}
 */
proto.IrrigationRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.IrrigationRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.IrrigationRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.IrrigationRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.IrrigationRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f !== 0) {
    writer.writeInt32(
      1,
      f
    );
  }
};


/**
 * optional int32 id = 1;
 * @return {number}
 */
proto.IrrigationRequest.prototype.getId = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.IrrigationRequest} returns this
 */
proto.IrrigationRequest.prototype.setId = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.EmptyMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.EmptyMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.EmptyMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.EmptyMessage.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.EmptyMessage}
 */
proto.EmptyMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.EmptyMessage;
  return proto.EmptyMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.EmptyMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.EmptyMessage}
 */
proto.EmptyMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.EmptyMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.EmptyMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.EmptyMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.EmptyMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};


goog.object.extend(exports, proto);