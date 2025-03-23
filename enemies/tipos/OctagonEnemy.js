import Enemy from '../Enemy.js';

export default class OctagonEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'octagon',
            size: 45,
            speed: 3,
            health: 150,
            color: '#8B4513',
            damage: 37.5,
            optimalRange: 250,
            shootProbability: 0
        });
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
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    // Override para que se mueva más rápido cuando está cerca del jugador
    moveTowardsPlayer(player) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Velocidad aumentada cuando está cerca
        const currentSpeed = distance < 200 ? this.speed * 1.5 : this.speed;
        
        // Si hay un rango óptimo, mantener esa distancia
        if (this.optimalRange > 0 && distance < this.optimalRange) {
            this.x -= (dx / distance) * currentSpeed;
            this.y -= (dy / distance) * currentSpeed;
        } else {
            this.x += (dx / distance) * currentSpeed;
            this.y += (dy / distance) * currentSpeed;
        }
    }
} 