import Enemy from '../Enemy.js';

export default class OctagonEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'octagon',
            size: 45,
            speed: 2.5,
            health: 150,
            color: '#8B4513',
            damage: 40,
            optimalRange: 0,
            shootProbability: 0
        });
        
        // Parámetros para el comportamiento de carga
        this.chargeRange = 250;
        this.normalSpeed = this.speed;
        this.chargeSpeed = this.speed * 2.5;
        this.isCharging = false;
        this.chargeCooldown = 0;
        this.maxChargeCooldown = 150;
        this.chargeTime = 0;
        this.maxChargeTime = 35;
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Cuerpo octagonal
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.beginPath();
        
        // Dibujamos el octágono
        const sides = 8;
        const angle = (Math.PI * 2) / sides;
        ctx.moveTo(this.x + this.size/2 * Math.cos(0), this.y + this.size/2 * Math.sin(0));
        
        for (let i = 1; i <= sides; i++) {
            ctx.lineTo(
                this.x + this.size/2 * Math.cos(angle * i),
                this.y + this.size/2 * Math.sin(angle * i)
            );
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Ojos
        const eyeSize = this.size * 0.1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca de determinación
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4, this.y + this.size/6);
        ctx.lineTo(this.x + this.size/4, this.y + this.size/6);
        ctx.stroke();
        
        // Efecto visual de carga
        if (this.isCharging) {
            ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    // Override para implementar comportamiento de carga
    moveTowardsPlayer(player) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        // Actualizar cooldown de carga
        if (this.chargeCooldown > 0) {
            this.chargeCooldown--;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si estamos cargando
        if (this.isCharging) {
            this.chargeTime++;
            
            // Si hemos cargado suficiente tiempo, detener la carga
            if (this.chargeTime >= this.maxChargeTime) {
                this.isCharging = false;
                this.chargeTime = 0;
                this.chargeCooldown = this.maxChargeCooldown;
                this.speed = this.normalSpeed;
            } else {
                // Moverse rápidamente hacia el jugador durante la carga
                this.x += (dx / distance) * this.chargeSpeed;
                this.y += (dy / distance) * this.chargeSpeed;
            }
            return;
        }
        
        // Si estamos a distancia de carga y no hay cooldown, iniciar carga
        if (!this.isCharging && this.chargeCooldown === 0 && distance <= this.chargeRange) {
            this.isCharging = true;
            this.speed = this.chargeSpeed;
            return;
        }
        
        // Movimiento normal - acercarse al jugador
        this.x += (dx / distance) * this.normalSpeed;
        this.y += (dy / distance) * this.normalSpeed;
    }
    
    update(player) {
        // Actualizar parpadeo
        if (this.isBlinking) {
            this.blinkTimer--;
            if (this.blinkTimer <= 0) {
                this.isBlinking = false;
            }
        }
        
        // Mover hacia el jugador con el comportamiento modificado
        this.moveTowardsPlayer(player);
        
        // Actualizar proyectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.dx;
            proj.y += proj.dy;
        });

        // Eliminar proyectiles fuera de la pantalla
        this.projectiles = this.projectiles.filter(proj => {
            if (typeof window !== 'undefined' && window.game && window.game.canvas) {
                return proj.x > 0 && proj.x < window.game.canvas.width && 
                       proj.y > 0 && proj.y < window.game.canvas.height;
            }
            return true;
        });
    }
} 