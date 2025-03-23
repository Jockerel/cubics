import Enemy from '../Enemy.js';

export default class CircleEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'circle',
            size: 30,
            speed: 2,
            health: 50,
            color: '#808080',
            damage: 25
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 3;
        
        // Cuerpo circular (gris)
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos
        const eyeSize = this.size * 0.1;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - this.size/5, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/5, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/5, 0, Math.PI);
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
} 