import React from 'react';

function SupportPage() {
  return (
    <div>
      <h3>Suporte / Ajuda</h3>
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Pesquisar no FAQ" />
      </div>
      <div className="accordion" id="faqAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header" id="heading1">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
              Não consigo bater ponto: estou fora do perímetro
            </button>
          </h2>
          <div id="collapse1" className="accordion-collapse collapse show" aria-labelledby="heading1" data-bs-parent="#faqAccordion">
            <div className="accordion-body">
              <ul>
                <li>Cheque sua localização e dirija-se para dentro da área permitida.</li>
                <li>Certifique-se de que permissões de geolocalização estão ativadas no seu dispositivo.</li>
                <li>Se o problema persistir, contate o suporte.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header" id="heading2">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
              Como solicitar um ajuste?
            </button>
          </h2>
          <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="heading2" data-bs-parent="#faqAccordion">
            <div className="accordion-body">
              Acesse a página "Solicitar ajuste", preencha os campos e envie a solicitação. Ela será analisada pelo RH.
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header" id="heading3">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
              Troca de senha e bloqueios
            </button>
          </h2>
          <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#faqAccordion">
            <div className="accordion-body">
              Você pode alterar sua senha na página de perfil. Caso esqueça a senha, utilize a opção de redefinir senha na tela de login.
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h5>Contato do RH</h5>
        <p>Email: rh@empresaexemplo.com</p>
        <p>Telefone: 1234-5678</p>
        <p>Horário: Seg-Sex 09:00–18:00</p>
      </div>
    </div>
  );
}

export default SupportPage;