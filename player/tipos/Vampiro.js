import Player from '../Player.js';

export default class Vampiro extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Vampiro";
        this.description = "Especialista en robo de vida, pero sin armadura ni regeneración natural.";
        
        // Modificar las estadísticas para el vampiro
        this.stats.armor = 0;
        this.stats.lifeSteal = 5;
        this.stats.healthRegen = 0;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#8B0000'; // Rojo oscuro
    }
    
    // Sobrescribir el método draw para personalizar la apariencia
    draw(ctx) {
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;

        // Cuerpo del cubo con color personalizado
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Borde del cubo
        ctx.strokeStyle = '#500000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos rojos brillantes
        const eyeSize = this.size * 0.15;
        ctx.fillStyle = '#FF0000';
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#FF8080';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa malévola con colmillos
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/4, 0, Math.PI);
        ctx.stroke();
        
        // Colmillos
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/6, this.y + this.size/8);
        ctx.lineTo(this.x - this.size/6 - this.size/12, this.y + this.size/4);
        ctx.lineTo(this.x - this.size/6 + this.size/12, this.y + this.size/8);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/6, this.y + this.size/8);
        ctx.lineTo(this.x + this.size/6 + this.size/12, this.y + this.size/4);
        ctx.lineTo(this.x + this.size/6 - this.size/12, this.y + this.size/8);
        ctx.fill();

        // Capa vampírica
        ctx.fillStyle = '#500000';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2 - 10, this.y - this.size/3);
        ctx.lineTo(this.x - this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2 + 10, this.y - this.size/3);
        ctx.lineTo(this.x + this.size/2 + 15, this.y + this.size/2);
        ctx.lineTo(this.x - this.size/2 - 15, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();

        // Dibujar proyectiles con efecto de sangre
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(139, 0, 0, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#FF3333');
            gradient.addColorStop(0.6, '#CC0000');
            gradient.addColorStop(1, '#8B0000');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar proyectil principal
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Destellos
            ctx.fillStyle = '#FF8080';
            ctx.beginPath();
            ctx.arc(proj.x - proj.size/3, proj.y - proj.size/3, proj.size/4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    
    // Sobrescribir el método para que no pueda mejorar la regeneración de vida
    useSkillPoint(stat) {
        // Si intenta mejorar la regeneración de vida, retornar false
        if (stat === 'healthRegen') {
            return false;
        }
        
        // Si intenta mejorar la armadura, retornar false para mantenerla en 0
        if (stat === 'armor') {
            return false;
        }
        
        // Para el robo de vida, aumentar en 1% en lugar de 0.8%
        if (stat === 'lifeSteal') {
            if (this.skillPoints <= 0) return false;
            
            this.stats.lifeSteal += 1 * this.evolutionMultipliers.lifeSteal;
            this.skillPoints--;
            return true;
        }
        
        // Para otras estadísticas, usar el comportamiento por defecto
        return super.useSkillPoint(stat);
    }
} 