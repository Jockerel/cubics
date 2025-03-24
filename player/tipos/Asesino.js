import Player from '../Player.js';

export default class Asesino extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Asesino";
        this.description = "Alta velocidad y daño crítico, pero poca vida y defensa.";
        
        // Modificar las estadísticas para el asesino
        this.stats.health = 80;
        this.stats.maxHealth = 80;
        this.stats.armor = 3;
        this.stats.strength = 22;
        this.stats.agility = 15;
        this.stats.attackSpeed = 1.5;
        this.stats.critChance = 25;
        this.stats.critDamage = 200;
        this.stats.moveSpeed = 7;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#8A2BE2';
    }
    
    // Sobrescribir el método draw para personalizar la apariencia
    draw(ctx) {
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Cuerpo del cubo con color personalizado (más delgado)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2.5, this.y - this.size/2, this.size/1.25, this.size);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Borde del cubo
        ctx.strokeStyle = '#6a1fa8';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2.5, this.y - this.size/2, this.size/1.25, this.size);

        // Ojos afilados
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/5, this.y - this.size/6);
        ctx.lineTo(this.x - this.size/12, this.y - this.size/8);
        ctx.lineTo(this.x - this.size/12, this.y - this.size/4);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/5, this.y - this.size/6);
        ctx.lineTo(this.x + this.size/12, this.y - this.size/8);
        ctx.lineTo(this.x + this.size/12, this.y - this.size/4);
        ctx.closePath();
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/6, this.y - this.size/6, this.size/20, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/6, this.y - this.size/6, this.size/20, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa malévola
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/5, 0, Math.PI);
        ctx.stroke();
        
        // Colmillos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/8, this.y + this.size/8);
        ctx.lineTo(this.x - this.size/10, this.y + this.size/5);
        ctx.lineTo(this.x - this.size/12, this.y + this.size/8);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/8, this.y + this.size/8);
        ctx.lineTo(this.x + this.size/10, this.y + this.size/5);
        ctx.lineTo(this.x + this.size/12, this.y + this.size/8);
        ctx.closePath();
        ctx.fill();

        // Brazos delgados
        ctx.strokeStyle = '#6a1fa8';
        ctx.lineWidth = 2;
        // Brazo izquierdo
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2.5, this.y);
        ctx.lineTo(this.x - this.size/2 - 15, this.y);
        ctx.stroke();
        // Brazo derecho
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/2.5 - this.size/5, this.y);
        ctx.lineTo(this.x + this.size/2 + 15 - this.size/5, this.y);
        ctx.stroke();

        // Cuchillas en las manos
        ctx.fillStyle = '#E0E0E0';
        // Cuchilla izquierda
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2 - 15, this.y - 5);
        ctx.lineTo(this.x - this.size/2 - 25, this.y);
        ctx.lineTo(this.x - this.size/2 - 15, this.y + 5);
        ctx.closePath();
        ctx.fill();
        // Cuchilla derecha
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/2 + 15 - this.size/5, this.y - 5);
        ctx.lineTo(this.x + this.size/2 + 25 - this.size/5, this.y);
        ctx.lineTo(this.x + this.size/2 + 15 - this.size/5, this.y + 5);
        ctx.closePath();
        ctx.fill();

        // Dibujar proyectiles con efecto especial de velocidad
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(138, 43, 226, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#9370DB');
            gradient.addColorStop(0.6, '#8A2BE2');
            gradient.addColorStop(1, '#6a1fa8');

            // Estela de velocidad
            ctx.fillStyle = 'rgba(138, 43, 226, 0.2)';
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(proj.x - (proj.dx * i * 1.5), proj.y - (proj.dy * i * 1.5), 
                    proj.size * (1 - i * 0.2), 0, Math.PI * 2);
                ctx.fill();
            }

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
    
    // Sobrescribir el método attack para aumentar la probabilidad de críticos
    attack(enemies) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        // Encontrar el enemigo más cercano
        let closestEnemy = null;
        let minDistance = this.attackRange;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.attackRange && (closestEnemy === null || distance < minDistance)) {
                closestEnemy = enemy;
                minDistance = distance;
            }
        });

        if (closestEnemy) {
            const dx = closestEnemy.x - this.x;
            const dy = closestEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Atacar con alta probabilidad de crítico
            // Para el asesino, la probabilidad de crítico aumenta cuanto más cerca esté del enemigo
            const distanceModifier = 1 - (distance / this.attackRange) * 0.5;
            const critChance = this.stats.critChance * distanceModifier;
            const isCritical = Math.random() * 100 < critChance;
            const damage = this.stats.strength * (isCritical ? this.stats.critDamage / 100 : 1);
            
            // Crear proyectil
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * 7, // Más rápido
                dy: (dy / distance) * 7,
                size: 10, // Más pequeño
                damage: damage,
                isCritical: isCritical
            });
            
            this.attackCooldown = this.maxAttackCooldown;
        }
    }
} 