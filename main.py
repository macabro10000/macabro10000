import os
from flask import Flask, render_template_string, request, redirect

app = Flask(__name__)
datos = {"oro": "4,670.08", "historial": []}

@app.route('/')
def home():
    return render_template_string('''
    <body style="background:#000;color:#fff;text-align:center;font-family:sans-serif;padding:20px;">
        <h1>🏛️ Panel Nikolay VIP</h1>
        <div style="border:2px solid #f44;padding:20px;border-radius:15px;background:#111;">
            <h2>ORO: <span style="color:#0f0">${{d.oro}}</span></h2>
            <p style="color:#f44;font-weight:bold;">ESTRATEGIA: VENTA (SELL)</p>
            <form action="/op" method="post"><button style="background:#f44;color:#fff;padding:20px;width:100%;border-radius:10px;font-weight:bold;border:none;font-size:18px;">EJECUTAR Y GRABAR</button></form>
        </div>
        <h3 style="margin-top:30px;">📚 BITÁCORA DE HOY</h3>
        <div style="text-align:left;background:#1a1a1a;padding:15px;border-radius:10px;">
            {% for i in d.historial %} <div style="color:#0f0;border-bottom:1px solid #333;padding:5px;">✓ {{i}}</div> {% endfor %}
        </div>
    </body>
    ''', d=datos)

@app.route('/op', methods=['POST'])
def op():
    datos['historial'].insert(0, f"Venta Oro a {datos['oro']}")
    return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
