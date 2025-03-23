import Enemy from '../Enemy.js';

export default class SquareEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'square',
            size: 35,
            speed: 2,
            health: 25,
            color: '#2E7D32',
            damage: 20
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        
        // Cuerpo cuadrado
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Ojos
        const eyeSize = this.size * 0.1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/6, this.size/5, 0, Math.PI);
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
} 