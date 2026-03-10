// Enemy prefab
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame); // call Sprite parent class
        scene.add.existing(this);           // add npc to existing scene
        scene.physics.add.existing(this);   // add physics body to scene

        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setCollideWorldBounds(true);

        // set custom properties
        this.health = 10.0;
        this.direction = direction;
        this.controlVelocity = 100; // in pixels
        this.dashCooldown = 300;    // in ms
        this.hurtTimer = 250;       // in ms
        this.pathNodes = [];
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

    findTarget() {
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

    startPathing(path) {
        // console.log(this, path);

        path.shift(); // remove first node, on the tile already or else it may slightly backtrack

        if (this.debug) { // Debug
            for (const { x: tileX, y: tileY } of path) {
                const nodeWorldPos = this.scene.tileLayer.tileToWorldXY(tileX + 0.5, tileY + 0.5, null, this.scene.cameras.main);
                this.scene.debrisEmitter.emitParticleAt(nodeWorldPos.x, nodeWorldPos.y, 1);
            }
        }

        this.pathNodes = path;
        this.fsm.transition('move');

        this.updatePathingMovement();
    }

    stopPathing() {
        this.pathNodes = [];
        this.fsm.transition('idle');
    }

    checkPathing() {
        if (this.pathNodes.length == 0) {
            this.stopPathing();
            return;
        }

        const node = this.pathNodes[0];
        const nodeWorldPos = this.scene.tileLayer.tileToWorldXY(node.x + 0.5, node.y + 0.5, null, this.scene.cameras.main);

        const distance = Phaser.Math.Distance.BetweenPoints(this, nodeWorldPos);        

        if (distance < 4) {
            this.body.reset(nodeWorldPos.x, nodeWorldPos.y);
            this.pathNodes.shift();
            if (this.pathNodes.length > 0) {
                this.updatePathingMovement();
            }

            return;
        }

        // Stuck detection
        if (this.body.speed < this.controlVelocity * 0.5) {
            this.stopPathing();
        }
    }

    updatePathingMovement() {
        if (this.pathNodes.length == 0) {
            return;
        }

        const node = this.pathNodes[0];
        const chase = this.pathNodes.length == 1;

        const worldPos = chase ? this.scene.hero : this.scene.tileLayer.tileToWorldXY(node.x + 0.5, node.y + 0.5, null, this.scene.cameras.main);
        this.scene.physics.moveToObject(this, worldPos, this.controlVelocity);

        this.direction = getFacingDirection(this, worldPos); 
        this.anims.play(`walk-${this.direction}`, true);
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
        if (this.health == 0) {
            return; // Currently dying, don't retrigger death effects
        }

        this.health = Math.max(0, this.health - damage);

        if (this.health == 0) {
            this.die();
        } else {
            this.fsm.transition('hurt');
        }
    }
    
    die() {
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
        npc.checkPathing();
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
            this.stateMachine.transition('idle');
        });
    }
}
