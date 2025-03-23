import Enemy from '../Enemy.js';

export default class PentagonEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'pentagon',
            size: 35,
            speed: 1.5,
            health: 25,
            color: '#2E7D32',
            damage: 20,
            optimalRange: 200,
            shootProbability: 0.01
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        
        // Cuerpo pentagonal
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.beginPath();
        
        // Dibujamos el pentágono
        const sides = 5;
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