package handler

import (
	"encoding/json"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"
)

type WalletHandler struct {
	walletSvc *service.WalletService
	txRepo    domain.TransactionRepository
}

func NewWalletHandler(ws *service.WalletService, tr domain.TransactionRepository) *WalletHandler {
	return &WalletHandler{
		walletSvc: ws,
		txRepo:    tr,
	}
}

func (h *WalletHandler) GetBalance(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	bal, err := h.walletSvc.GetUserBalance(r.Context(), user.ID)
	if err != nil {
		bal = user.Wallet.BalanceCents
	}

	response.JSON(w, http.StatusOK, map[string]int64{
		"balance_cents": bal,
	})
}

type DepositDTO struct {
	AmountCents int64  `json:"amount_cents"`
	Gateway     string `json:"gateway"`
}

func (h *WalletHandler) Deposit(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	var dto DepositDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	gateway := dto.Gateway
	if gateway == "" {
		gateway = "PIX"
	}

	tx, err := h.walletSvc.DepositCredits(r.Context(), user.ID.Hex(), dto.AmountCents, gateway, "ext_dep_"+user.ID.Hex())
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, tx)
}

func (h *WalletHandler) ListTransactions(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	txs, err := h.txRepo.ListByUserID(r.Context(), user.ID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Falha ao listar transações")
		return
	}

	if txs == nil {
		txs = []*domain.Transaction{}
	}

	response.JSON(w, http.StatusOK, txs)
}
