function Player(x, y, gravity, level) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.gravity = (gravity / 180) * Math.PI;
    this.angle = (gravity / 180) * Math.PI;
    this.pan = new Vec2(x, y);
    this.level = level;
    this.drawSize = 18;
    this.size = 20;
};

Player.prototype.view = function() {
    ctx.translate(width * 0.5, height * 0.5);
    ctx.rotate(-this.angle);
    ctx.translate(-this.pan.x, -this.pan.y);
};

Player.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.drawSize, 0, 2 * Math.PI);
    ctx.fill();
};

Player.prototype.update = function() {
    this.pan.sub(this.pos);
    this.pan.mult(0.8);
    this.pan.add(this.pos);
    var angleDiff = (this.gravity - this.angle);
    while(angleDiff < -Math.PI) {
        angleDiff += Math.PI * 2;
        this.angle -= Math.PI * 2;
    }
    while(angleDiff > Math.PI) {
        angleDiff -= Math.PI * 2;
        this.angle += Math.PI * 2;
    }
    this.angle += angleDiff * 0.05;
    var gravity = new Vec2(0, 0.2);
    gravity.rotate(this.gravity);
    var side = new Vec2(-1, 0);
    side.rotate(this.gravity);
    var move = side.get();
    move.mult(0.5);
    this.pos.add(this.vel);
    this.vel.add(gravity);
    var calculatedPoints = [];
    for(var i = 0; i < 2; i++) {
	var closestPoint = this.level.closestPoint(this.pos, this.size * 15, calculatedPoints);
	calculatedPoints.push(closestPoint);
	if(closestPoint[0] < this.size) {
	    if(closestPoint[2]["onTouch"]) {
		functions[closestPoint[2]["onTouch"]](this);
		return;
	    }
            var push = closestPoint[1].get();
            push.sub(this.pos);
            push.normalize();
            var normal = push.get();
            push.mult(this.size - closestPoint[0]);
            this.pos.sub(push);
            var accel = normal.get();
            accel.mult(this.vel.dot(normal));
            if(this.vel.dot(normal) > 7) {
		accel.mult(1.5);
            }
            this.vel.sub(accel);
            
            if(keys[38]) {
		var force = gravity.get();
		force.mult(-30);
		this.vel.add(force);
            }

	    if(!closestPoint[2]["noGravity"]) {
		this.gravity = normal.heading() - Math.PI * 0.5;
	    }
	} else {
	    if(closestPoint[0] < this.size * 10) {
		if(!closestPoint[2]["noGravity"]) {
		    var normal = closestPoint[1].get();
		    normal.sub(this.pos);
		    normal.normalize();
		    var newGravity = normal.heading() - Math.PI * 0.5;
		    var angleDiff = (newGravity - this.gravity);
		    while(angleDiff < -Math.PI) {
			angleDiff += Math.PI * 2;
			this.gravity -= Math.PI * 2;
		    }
		    while(angleDiff > Math.PI) {
			angleDiff -= Math.PI * 2;
			this.gravity += Math.PI * 2;
		    }
		    this.gravity += angleDiff * Math.pow(1 - (closestPoint[0] / (this.size * 10)), 5);
		}
	    }
	}
    }
    this.vel.add(this.level.force(this.pos));
    var accel = side.get();
    accel.mult(side.dot(this.vel) * 0.1);
    this.vel.sub(accel);

    if(keys[37]) {
        this.vel.add(move);
    }
    if(keys[39]) {
        this.vel.sub(move);
    }
};
