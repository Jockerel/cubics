import Player from '../Player.js';

export default class Velocista extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Velocista";
        this.description = "Alta velocidad y movilidad. La velocidad aumenta su fuerza de ataque.";
        
        // Modificar las estadísticas para el velocista
        this.stats.moveSpeed = 5;
        this.stats.agility = 7;
        this.stats.attackSpeed = 1.2;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#00FFFF'; // Cian
    }
    
    // Sobrescribir el método draw para personalizar la apariencia
    draw(ctx) {
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Efecto de velocidad/movimiento (estela)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2 - 5, this.y - this.size/2, this.size, this.size);
        ctx.fillRect(this.x - this.size/2 - 10, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1;

        // Cuerpo del cubo con color personalizado
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Borde del cubo
        ctx.strokeStyle = '#008B8B';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos
        const eyeSize = this.size * 0.15;
        ctx.fillStyle = '#000';
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa confiada
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/6, this.size/5, 0, Math.PI);
        ctx.stroke();

        // Diseño de rayo en el pecho
        ctx.fillStyle = '#008B8B';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size/6);
        ctx.lineTo(this.x + this.size/4, this.y);
        ctx.lineTo(this.x, this.y + this.size/4);
        ctx.lineTo(this.x + this.size/8, this.y + this.size/4);
        ctx.lineTo(this.x - this.size/4, this.y + this.size/2);
        ctx.lineTo(this.x - this.size/8, this.y + this.size/8);
        ctx.lineTo(this.x - this.size/4, this.y + this.size/8);
        ctx.closePath();
        ctx.fill();

        // Dibujar proyectiles con efecto de velocidad
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
            ctx.shadowBlur = 15;

            // Estela del proyectil
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(proj.x - proj.dx * 2, proj.y - proj.dy * 2, proj.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#E0FFFF');
            gradient.addColorStop(0.6, '#00FFFF');
            gradient.addColorStop(1, '#008B8B');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar proyectil principal
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Destellos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(proj.x - proj.size/3, proj.y - proj.size/3, proj.size/4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    // Sobrescribir para aplicar las bonificaciones especiales
    useSkillPoint(stat) {
        if (this.skillPoints <= 0) return false;
        
        // Caso especial para la vida: solo aumenta 4 puntos en lugar de 8
        if (stat === 'health') {
            this.stats.maxHealth += 4 * this.evolutionMultipliers.health;
            this.stats.health = this.stats.maxHealth;
            this.skillPoints--;
            return true;
        }
        
        // Caso especial para la velocidad: aumenta 0.5 en lugar de 0.25
        // y además otorga 1 punto de fuerza por cada 0.5 de velocidad
        if (stat === 'moveSpeed') {
            const initialMoveSpeed = this.stats.moveSpeed;
            this.stats.moveSpeed += 0.5 * this.evolutionMultipliers.moveSpeed;
            // Calcular cuántos incrementos de 0.5 se han aplicado
            const speedIncrease = this.stats.moveSpeed - initialMoveSpeed;
            // Aumentar la fuerza en 1 por cada 0.5 de velocidad
            if (speedIncrease >= 0.5) {
                const strengthIncrease = Math.floor(speedIncrease / 0.5);
                this.stats.strength += strengthIncrease;
            }
            this.skillPoints--;
            return true;
        }
        
        // Para otras estadísticas, usar el comportamiento por defecto
        return super.useSkillPoint(stat);
    }
} 