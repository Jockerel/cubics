import Enemy from '../Enemy.js';

export default class TriangleEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'triangle',
            size: 40,
            speed: 2,
            health: 30,
            color: '#4a235a',
            damage: 15,
            shootProbability: 0.008
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        
        // Cuerpo de triángulo
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();
        
        // Ojos
        const eyeSize = this.size * 0.08;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/5, this.y, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/5, this.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    // Override para disparar proyectiles triangulares
    shoot(player) {
        if (Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * 6,
                dy: (dy / distance) * 6,
                size: 8,
                damage: this.damage,
                type: 'triangle'
            });
        }
    }
} 