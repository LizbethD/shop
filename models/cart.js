module.exports = function Cart(oldCart){
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrecio = oldCart.totalPrecio || 0;

    this.add = function(item, id){
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, precio: 0};
        }
        storedItem.qty++;
        storedItem.precio = storedItem.item.precio * storedItem.qty;
        this.totalQty++;
        this.totalPrecio += storedItem.item.precio;
    }

    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].precio -= this.items[id].item.precio;
        this.totalQty--;
        this.totalPrecio -= this.items[id].item.precio;
    
        if (this.items[id].qty <= 0){
            delete this.items[id];
        }
    };

    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrecio -= this.items[id].precio;
        delete this.items[id];
    };

    
    this.generateArray = function(){
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
};