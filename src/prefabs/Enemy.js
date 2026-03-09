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

        // initialize state machine managing npc (initial state, possible states, state args[])
        this.fsm = new StateMachine('idle', {
            idle: new NPCIdleState(),
            move: new NPCMoveState(),
            swing: new NPCSwingState(),
            dash: new NPCDashState(),
            hurt: new NPCHurtState(),
        }, [scene, this]);   // pass these as arguments to maintain scene/object context in the FSM
    }

    update() {
        this.fsm.step();
    }

    attack(target) {
        target.hurt(10);
    }

    hurt(damage) {
        this.health = Math.max(0, this.health - damage);

        if (this.health == 0) {
            this.die();
        } else {
            this.fsm.transition('hurt');
        }
    }
    
    die() {
        this.setTint(0x44_00_00);
    }
}

// npc-specific state classes
class NPCIdleState extends State {
    enter(scene, npc) {
        npc.setVelocity(0);
        npc.anims.play(`walk-${npc.direction}`);
        npc.anims.stop();
    }

    execute(scene, npc) {
        // TODO scan for player then pathfind towards
    }
}

class NPCMoveState extends State {
    execute(scene, npc) {
        // handle movement
        let moveDirection = new Phaser.Math.Vector2(0, 0);

        // TODO pathfind towards player

        // normalize movement vector, update npc position, and play proper animation
        moveDirection.normalize();
        npc.setVelocity(npc.controlVelocity * moveDirection.x, npc.controlVelocity * moveDirection.y);
        npc.anims.play(`walk-${npc.direction}`, true);
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
