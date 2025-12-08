// Função para remover acentos e converter para maiúsculas
export const toUpperNoAccent = (text) => {
  if (!text) return text;
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

// Função para formatar placa (maiúscula sem acento e sem caracteres especiais)
export const formatPlaca = (text) => {
  if (!text) return text;
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);
};