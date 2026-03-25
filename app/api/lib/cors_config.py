# backend/cors_config.py
#
# Configuração de CORS para o Flask — necessário para aceitar
# requisições vindas do Next.js (domínio diferente em dev e prod).
#
# Instalação:
#   pip install flask-cors
#
# Uso no app.py / __init__.py:
#   from cors_config import configure_cors
#   configure_cors(app)

import os
from flask_cors import CORS


def configure_cors(app):
    """
    Registra o middleware de CORS no app Flask.

    Em desenvolvimento: aceita qualquer origem localhost (porta 3000).
    Em produção:        aceita apenas a URL do frontend configurada via env.
    """
    env = os.getenv('FLASK_ENV', 'development')

    if env == 'production':
        # Ex: FRONTEND_URL=https://meupainel.com
        allowed_origins = [os.getenv('FRONTEND_URL', '')]
    else:
        allowed_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,   # necessário para repassar cookies de sessão
        allow_headers=['Content-Type', 'Authorization', 'Cookie'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    )

    app.logger.info(f'CORS configurado para: {allowed_origins}')
