// Enemy prefab
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame); // call Sprite parent class
        scene.add.existing(this);           // add npc to existing scene
        scene.physics.add.existing(this);   // add physics body to scene

        this.body.setSize(this.width * 0.5, this.height * 0.5);
        this.body.setCollideWorldBounds(true);
        this.body.setFriction(1.0);

        // set custom properties
        this.health = 10.0;
        this.direction = direction;
        this.controlVelocity = 100; // in pixels
        this.dashCooldown = 300;    // in ms
        this.hurtTimer = 250;       // in ms

        this.pathNodes = [];
        this.targetPos = new Phaser.Math.Vector2(x, y);
        this.moveToTarget = false;

        this.debug = false;

        // initialize state machine managing npc (initial state, possible states, state args[])
        this.fsm = new StateMachine('idle', {
            idle: new NPCIdleState(),
            move: new NPCMoveState(),
            swing: new NPCSwingState(),
            dash: new NPCDashState(),
            hurt: new NPCHurtState(),
        }, [scene, this]);   // pass these as arguments to maintain scene/object context in the FSM
    }

    // Called during idle state
    findTarget() {
        if (!this.canTargetHero()) {
            return;
        }

        if (this.isHeroInRange()) {
            this.startPathing([]);
            return;
        }

        const { x: posTileX, y: posTileY } = this.getTilePos();
        const { x: targetTileX, y: targetTileY } = this.scene.hero.getTilePos();

        // Check line of sight first
        for (const { x: tileX, y: tileY } of tracePixelLine(posTileX, posTileY, targetTileX, targetTileY)) {
            if (this.scene.tileLayer.getTileAt(tileX, tileY).collides) {
                return; // Terminate, vision to target obstructed
            }
        }

        game.finder.findPath(posTileX, posTileY, targetTileX, targetTileY, path => { this.startPathing(path); });
        game.finder.calculate();
    }

    // Called when EasyStar async finds a path
    startPathing(path) {
        // if (this.debug) console.log("startPathing");
        // if (this.debug) console.log(this, path);

        path.shift(); // remove first node, on the tile already or else it may slightly backtrack

        if (this.debug) { // Debug
            for (const { x: tileX, y: tileY } of path) {
                const nodeWorldPos = this.scene.tileLayer.tileToWorldXY(tileX + 0.5, tileY + 0.5, null, this.scene.cameras.main);
                this.scene.debrisEmitter.emitParticleAt(nodeWorldPos.x, nodeWorldPos.y, 1);
            }
        }

        this.pathNodes = path;
        this.fsm.transition('move');

        this.shiftPathingNode();
    }

    setTargetPos(pos) {
        // if (this.debug) console.log("setTargetPos", pos);

        this.targetPos = pos;
        this.direction = getFacingDirection(this, pos);
        this.scene.physics.moveToObject(this, pos, this.controlVelocity);
    }

    shiftPathingNode() {
        //if (this.debug) console.log("shiftPathingNode");

        const chaseHero = this.pathNodes.length == 0;

        if (chaseHero && !this.isHeroInRange()) {
            this.stopPathing();
            return;
        }

        const tileNode = this.pathNodes.shift();

        const worldPos = chaseHero ? this.scene.hero : this.scene.tileLayer.tileToWorldXY(tileNode.x + 0.5, tileNode.y + 0.5, null, this.scene.cameras.main);
        this.setTargetPos(worldPos);

        this.anims.play(`walk-${this.direction}`, true);
        this.moveToTarget = true;
    }

    // Called during move state
    updatePathing() {
        // if (this.debug) console.log("updatePathing");

        if (!this.canTargetHero() || this.shouldStopPathing()) {
            this.stopPathing();
            return;
        }

        const distanceToNode = Phaser.Math.Distance.BetweenPoints(this, this.targetPos);        

        if (distanceToNode < 4) {
            this.body.reset(this.targetPos.x, this.targetPos.y);
            this.shiftPathingNode();

            return;
        }

        // Stuck detection
        if (this.body.speed < this.controlVelocity * 0.5) {
            this.stopPathing();
        }
    }

    shouldStopPathing() {
        // if (this.debug) console.log("shouldStopPathing");

        if (this.body.speed < this.controlVelocity * 0.5) {
            return true; // Enemy is stuck and can't move at normal speed
        }

        const noNodesLeft = this.pathNodes.length == 0;

        const playerOutOfRange = this.targetPos === this.scene.hero
            ? this.isHeroInRange()
            : false;

        return noNodesLeft && playerOutOfRange;
    }

    canTargetHero() {
        return this.scene.hero.health > 0;
    }

    isHeroInRange() {
        return Phaser.Math.Distance.BetweenPoints(this, this.scene.hero) < tileSize * 1.33;
    }

    stopPathing() {
        // if (this.debug) console.log("stopPathing");

        this.clearPathing();
        this.fsm.transition('idle');
    }

    clearPathing() {
        this.pathNodes = [];
        this.moveToTarget = false;
    }

    getTilePos(snapToGrid = true) {
        return this.scene.tileLayer.worldToTileXY(this.x, this.y, snapToGrid, null, this.scene.cameras.main);
    }

    update() {
        if (this.health <= 0) {
            return;
        }

        this.fsm.step();
    }

    attack(target) {
        target.hurt(10);
    }

    hurt(damage) {
        if (this.health <= 0) {
            return; // Currently dying, don't retrigger death effects
        }

        this.scene.strikeSound.play();

        this.health = Math.max(0, this.health - damage);

        if (this.health == 0) {
            // Just got zeroed by above binding
            this.die();
        } else {
            this.fsm.transition('hurt');
        }
    }
    
    die() {
        this.fsm.transition('idle');

        this.setTint(0x44_00_00);

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 0.1 },
            angle: { from: 0, to: Math.random() < 0.5 ? 360 : -360 },
            ease: 'Sine.easeInOut',
            duration: 1000,
            repeat: 0,
            onComplete: () => {
                this.destroy();
            }
        });

        this.setVelocity(0);
    }

    swordStrike() {
        if (!this.canTargetHero() || this.health <= 0) {
            return;
        }

        this.fsm.transition('swing');

        const radius = 8;
        const { x: centerX, y: centerY } = normalFromDirection(this.direction)
            .multiply({ x: this.width * 0.5, y: this.height * 0.5 })
            .add({ x: this.x, y: this.y });

        const bodiesInRect = this.scene.physics.overlapRect(centerX - radius * 0.5, centerY - radius * 0.5, radius, radius);

        for (let body of bodiesInRect) {
            if (body != this.body && body.gameObject != null && typeof body.gameObject.hurt === 'function') {
                this.attack(body.gameObject);
            }
        }
    }

    attack(target) {
        target.hurt(1);
    }
}

// npc-specific state classes
class NPCIdleState extends State {
    enter(scene, npc) {
        npc.setVelocity(0);
        npc.anims.play(`walk-${npc.direction}`);
        npc.anims.stop();

        if (npc.debug) {
            npc.setTint(0xFF_FF_FF); // Clear tint
        }
    }

    execute(scene, npc) {
        npc.findTarget();
    }
}

class NPCMoveState extends State {
    enter(scene, npc) {
        if (npc.debug) {
            npc.setTint(0x88_88_FF); // Blue
        }
    }

    execute(scene, npc) {
        npc.updatePathing();
    }
}

class NPCSwingState extends State {
    enter(scene, npc) {
        npc.setVelocity(0);
        npc.anims.play(`swing-${npc.direction}`);
        npc.once('animationcomplete', () => {
            this.stateMachine.transition('idle');
        })
    }
}

class NPCDashState extends State {
    enter(scene, npc) {
        npc.setVelocity(0);
        npc.anims.play(`swing-${npc.direction}`);
        npc.setTint(0x00AA00);     // turn green
        switch(npc.direction) {
            case 'up':
                npc.setVelocityY(-npc.controlVelocity * 3);
                break;
            case 'down':
                npc.setVelocityY(npc.controlVelocity * 3);
                break;
            case 'left':
                npc.setVelocityX(-npc.controlVelocity * 3);
                break;
            case 'right':
                npc.setVelocityX(npc.controlVelocity * 3);
                break;
        }

        // set a short cooldown delay before going back to idle
        scene.time.delayedCall(npc.dashCooldown, () => {
            npc.clearTint();
            this.stateMachine.transition('idle');
        });
    }
}

class NPCHurtState extends State {
    enter(scene, npc) {
        npc.setVelocity(0);
        npc.anims.play(`walk-${npc.direction}`);
        npc.anims.stop();
        npc.setTint(0xFF0000);     // turn red
        // create knockback by sending body in direction opposite facing direction
        switch(npc.direction) {
            case 'up':
                npc.setVelocityY(npc.controlVelocity*2);
                break;
            case 'down':
                npc.setVelocityY(-npc.controlVelocity*2);
                break;
            case 'left':
                npc.setVelocityX(npc.controlVelocity*2);
                break;
            case 'right':
                npc.setVelocityX(-npc.controlVelocity*2);
                break;
        }

        // set recovery timer
        scene.time.delayedCall(npc.hurtTimer, () => {
            npc.clearTint();
            npc.clearPathing();
            this.stateMachine.transition('idle');
        });
    }
}
