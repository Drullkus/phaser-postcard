// Hero prefab
class Hero extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, direction) {
        super(scene, x, y, texture, frame); // call Sprite parent class
        scene.add.existing(this);           // add Hero to existing scene
        scene.physics.add.existing(this);   // add physics body to scene

        this.body.setSize(this.width * 0.5, this.height * 0.5);
        this.body.setCollideWorldBounds(true);
        this.body.setFriction(1.0);

        // set custom Hero properties
        this.health = 10.0;
        this.direction = direction;
        this.controlVelocity = 100; // in pixels
        this.dashCooldown = 300;    // in ms
        this.hurtTimer = 250;       // in ms

        // initialize state machine managing hero (initial state, possible states, state args[])
        this.fsm = new StateMachine('idle', {
            idle: new HeroIdleState(),
            move: new HeroMoveState(),
            swing: new HeroSwingState(),
            dash: new HeroDashState(),
            hurt: new HeroHurtState(),
        }, [scene, this]);   // pass these as arguments to maintain scene/object context in the FSM
    }

    getTilePos() {
        return this.scene.tileLayer.worldToTileXY(this.x, this.y, true, null, this.scene.cameras.main);
    }

    update() {
        if (this.health > 0) {
            this.fsm.step();
        }
    }

    attack(target) {
        target.hurt(4); // 3 hits to kill an enemy
    }

    hurt(damage) {
        if (this.health == 0) {
            return; // Currently dying, don't retrigger death effects
        }

        const newHealth = Math.max(0, this.health - damage);

        if (newHealth == 0) {
            this.die();
        } else {
            this.health = newHealth;
            this.fsm.transition('hurt');
        }
    }
    
    die() {
        if (this.health == 0) {
            return; // Currently dying, don't retrigger death effects
        }

        this.health = 0;

        this.setTint(0x44_00_00);

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 0.1 },
            angle: { from: 0, to: 360 },
            ease: 'Sine.easeInOut',
            duration: 1000,
            repeat: 0,
            onComplete: () => {
                this.scene.playerKilled();
                this.destroy();
            }
        });
    }

    swordStrike() {
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
}

// hero-specific state classes
class HeroIdleState extends State {
    enter(scene, hero) {
        hero.setVelocity(0);
        hero.anims.play(`walk-${hero.direction}`);
        hero.anims.stop();
    }

    execute(scene, hero) {
        // use destructuring to make a local copy of the keyboard object
        const { left, right, up, down, space, shift } = scene.keys;

        // transition to swing if pressing space
        if(Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        // transition to dash if pressing shift
        if(Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
            return;
        }

        // transition to move if pressing a movement key
        if(left.isDown || right.isDown || up.isDown || down.isDown ) {
            this.stateMachine.transition('move');
            return;
        }
    }
}

class HeroMoveState extends State {
    execute(scene, hero) {
        // use destructuring to make a local copy of the keyboard object
        const { left, right, up, down, space, shift } = scene.keys;

        // transition to swing if pressing space
        if(Phaser.Input.Keyboard.JustDown(space)) {
            this.stateMachine.transition('swing');
            return;
        }

        // transition to dash if pressing shift
        if(Phaser.Input.Keyboard.JustDown(shift)) {
            this.stateMachine.transition('dash');
            return;
        }

        // transition to idle if not pressing movement keys
        if(!(left.isDown || right.isDown || up.isDown || down.isDown)) {
            this.stateMachine.transition('idle');
            return;
        }

        // handle movement
        let moveDirection = new Phaser.Math.Vector2(0, 0);
        if(up.isDown) {
            moveDirection.y = -1;
            hero.direction = 'up';
        } else if(down.isDown) {
            moveDirection.y = 1;
            hero.direction = 'down';
        }
        if(left.isDown) {
            moveDirection.x = -1;
            hero.direction = 'left';
        } else if(right.isDown) {
            moveDirection.x = 1;
            hero.direction = 'right';
        }
        // normalize movement vector, update hero position, and play proper animation
        moveDirection.normalize();
        hero.setVelocity(hero.controlVelocity * moveDirection.x, hero.controlVelocity * moveDirection.y);
        hero.anims.play(`walk-${hero.direction}`, true);
    }
}

class HeroSwingState extends State {
    enter(scene, hero) {
        hero.setVelocity(0);
        hero.swordStrike();
        hero.anims.play(`swing-${hero.direction}`);
        hero.once('animationcomplete', () => {
            this.stateMachine.transition('idle');
        })
    }
}

class HeroDashState extends State {
    enter(scene, hero) {
        hero.setVelocity(0);
        hero.anims.play(`swing-${hero.direction}`);
        hero.setTint(0x00AA00);     // turn green
        switch(hero.direction) {
            case 'up':
                hero.setVelocityY(-hero.controlVelocity * 3);
                break;
            case 'down':
                hero.setVelocityY(hero.controlVelocity * 3);
                break;
            case 'left':
                hero.setVelocityX(-hero.controlVelocity * 3);
                break;
            case 'right':
                hero.setVelocityX(hero.controlVelocity * 3);
                break;
        }

        // set a short cooldown delay before going back to idle
        scene.time.delayedCall(hero.dashCooldown, () => {
            hero.clearTint();
            this.stateMachine.transition('idle');
        });
    }
}

class HeroHurtState extends State {
    enter(scene, hero) {
        hero.setVelocity(0);
        hero.anims.play(`walk-${hero.direction}`);
        hero.anims.stop();
        hero.setTint(0xFF0000);     // turn red
        // create knockback by sending body in direction opposite facing direction
        switch(hero.direction) {
            case 'up':
                hero.setVelocityY(hero.controlVelocity*2);
                break;
            case 'down':
                hero.setVelocityY(-hero.controlVelocity*2);
                break;
            case 'left':
                hero.setVelocityX(hero.controlVelocity*2);
                break;
            case 'right':
                hero.setVelocityX(-hero.controlVelocity*2);
                break;
        }

        // set recovery timer
        scene.time.delayedCall(hero.hurtTimer, () => {
            hero.clearTint();
            this.stateMachine.transition('idle');
        });
    }
}
