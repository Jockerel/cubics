import Player from '../Player.js';

export default class Fantasma extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Fantasma";
        this.description = "Etéreo y ágil, difícil de golpear pero muy vulnerable al daño.";
        
        // Modificar las estadísticas para el fantasma
        this.stats.armor = -5; // Muy vulnerable al daño
        this.stats.agility = 15; // Alta evasión
        this.stats.moveSpeed = 6;
        this.stats.health = 80; // Menos vida
        this.stats.maxHealth = 80;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#E6E6FA'; // Lavanda pálido
        
        // Propiedades para efectos visuales
        this.alpha = 0.8; // Semitransparente
        this.glowIntensity = 0.5;
    }
    
    // Sobrescribir el método draw para personalizar la apariencia
    draw(ctx) {
        ctx.save();
        
        // Efecto de brillo alrededor
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(230, 230, 250, 0.1)');
        gradient.addColorStop(0.6, 'rgba(230, 230, 250, 0.05)');
        gradient.addColorStop(1, 'rgba(230, 230, 250, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Sombra
        ctx.shadowColor = 'rgba(176, 196, 222, 0.8)';
        ctx.shadowBlur = 15;

        // Aplicar transparencia
        ctx.globalAlpha = this.alpha;

        // Cuerpo fantasmal (forma más redondeada que un cubo)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Cola fantasmal que se estrecha
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/3, this.y);
        ctx.quadraticCurveTo(
            this.x, this.y + this.size, 
            this.x + this.size/3, this.y
        );
        ctx.closePath();
        ctx.fill();
        
        // Borde suave
        ctx.strokeStyle = '#B0C4DE';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        ctx.stroke();

        // Ojos brillantes
        const eyeSize = this.size * 0.1;
        ctx.fillStyle = '#000';
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(this.x - this.size/5, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(this.x + this.size/5, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/5 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/5 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Boca fantasmal (línea suave)
        ctx.strokeStyle = '#B0C4DE';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Pequeños detalles fantasmales (patrones etéreos)
        ctx.strokeStyle = 'rgba(176, 196, 222, 0.5)';
        ctx.lineWidth = 0.5;
        
        // Patrones ondulados
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.size/3, this.y + this.size/4 + i * 10);
            ctx.bezierCurveTo(
                this.x - this.size/6, this.y + this.size/4 + i * 10 - 5,
                this.x + this.size/6, this.y + this.size/4 + i * 10 + 5,
                this.x + this.size/3, this.y + this.size/4 + i * 10
            );
            ctx.stroke();
        }

        // Dibujar proyectiles con efecto fantasmal
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(176, 196, 222, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#E6E6FA');
            gradient.addColorStop(0.6, '#B0C4DE');
            gradient.addColorStop(1, '#6A5ACD');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(230, 230, 250, 0.3)';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size * 1.8, 0, Math.PI * 2);
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
            
            // Estela fantasmal del proyectil
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#E6E6FA';
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(proj.x - proj.dx * i/2, proj.y - proj.dy * i/2, proj.size * (1 - i/6), 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        ctx.restore();
    }
    
    // Sobrescribir para aplicar las bonificaciones especiales
    useSkillPoint(stat) {
        if (this.skillPoints <= 0) return false;
        
        // Caso especial para la agilidad: aumenta 6% en lugar de 0.8%
        if (stat === 'agility') {
            // Verificar que no exceda el límite de 75%
            if (this.stats.agility >= 75) {
                return false;
            }
            
            // Calcular cuánto aumentaría
            const increase = 6 * this.evolutionMultipliers.agility;
            
            // Si excede el límite de 75%, ajustar al límite
            if (this.stats.agility + increase > 75) {
                this.stats.agility = 75;
            } else {
                this.stats.agility += increase;
            }
            
            this.skillPoints--;
            return true;
        }
        
        // Para otras estadísticas, usar el comportamiento por defecto
        return super.useSkillPoint(stat);
    }
    
    // Sobrescribir el método takeDamage para incluir mayor probabilidad de esquivar
    takeDamage(amount) {
        // Verificar si hay esquiva basada en agilidad (hasta 75% para el fantasma)
        if (Math.random() * 100 < this.stats.agility) {
            return { damage: 0, type: 'miss', gameOver: false };
        }
        
        // Calcular daño con penalización por armadura negativa
        const damageReduction = this.stats.armor / (this.stats.armor + 100);
        let actualDamage = amount;
        
        // Si la armadura es negativa, aumentar el daño
        if (this.stats.armor < 0) {
            actualDamage = amount * (1 + Math.abs(this.stats.armor) / 100);
        } else {
            actualDamage = amount * (1 - damageReduction);
        }
        
        // Aplicar el daño
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        this.isBlinking = true;
        this.blinkTimer = 10;
        
        // Verificar si el jugador ha muerto
        if (this.stats.health <= 0) {
            return { damage: actualDamage, type: 'normal', gameOver: true };
        }
        
        return { damage: actualDamage, type: 'normal', gameOver: false };
    }
} 