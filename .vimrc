let data_dir = has('nvim') ? stdpath('data') . '/site' : '~/.vim'
if empty(glob(data_dir . '/autoload/plug.vim'))
  silent execute '!curl -fLo '.data_dir.'/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim'
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.vim/plugged')
"List your plugins here
Plug 'preservim/nerdtree'               " File explorer
Plug 'vim-airline/vim-airline'          " Status/tabline
Plug 'vim-airline/vim-airline-themes'   " Themes for vim-airline
Plug 'dense-analysis/ale'               " Asynchronous linting and syntax checking
Plug 'neoclide/coc.nvim', {'branch': 'release'}  " Autocompletado
Plug 'svermeulen/vim-easyclip' " Portapapeles
Plug 'ryanoasis/vim-devicons' " Plugin de iconos
Plug 'vimsence/vimsence' " Rich presence Discord
Plug 'jwalton512/vim-blade' " Sintaxis para archivos blade.php
Plug 'github/copilot.vim' " Copilot Vim

" End of Vim-Plug section
call plug#end()

" Configuration for NERDTree
nnoremap <C-n> :NERDTreeToggle<CR>

" Cambiar a la siguiente ventana (Ctrl + j)
nnoremap <C-j> :wincmd w<CR>

" Cambiar a la ventana anterior (Ctrl + k)
nnoremap <C-k> :wincmd W<CR>

" Cambiar a la ventana número X (Ctrl + número)
nnoremap <C-1> :1wincmd w<CR>
nnoremap <C-2> :2wincmd w<CR>
nnoremap <C-3> :3wincmd w<CR>
nnoremap <C-4> :4wincmd w<CR>
nnoremap <C-5> :5wincmd w<CR>
nnoremap <C-6> :6wincmd w<CR>
nnoremap <C-7> :7wincmd w<CR>
nnoremap <C-8> :8wincmd w<CR>
nnoremap <C-9> :9wincmd w<CR>

" Configuration for vim-airline
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#fnamemod = ':t'

" Configuration for ALE
let g:ale_linters = {
\   'javascript': ['eslint'],
\   'c': ['clangd'],
\   'cpp': ['clangd'],
\}
let g:ale_fixers = {
\   '*': ['remove_trailing_lines', 'trim_whitespace'],
\   'javascript': ['eslint'],
\   'c': ['clang-format'],
\   'cpp': ['clang-format'],
\}
let g:ale_fix_on_save = 0

" Configuration for coc.nvim
inoremap <silent><expr> <TAB> pumvisible() ? "\<C-n>" : "\<TAB>"
inoremap <silent><expr> <S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"
inoremap <silent><expr> <CR> pumvisible() ? coc#_select_confirm() : "\<CR>"
" Use coc for autocompletion and linting
" Additional configuration can be added as needed
" Clipboard
let g:EasyClipAlwaysUseClipboard=1
nmap <leader>y <Plug>(EasyClipYank)
nmap <leader>d <Plug>(EasyClipYank)
nmap <leader>p <Plug>(EasyClipYank)
" Enable mouse support (optional)
set mouse=a

" Enable line numbers (optional)
set number

" Syntax highlighting
syntax on
call plug#end()

